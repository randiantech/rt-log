var winston = require('winston');
var stringify = require('json-stringify-safe');
var environment = process.env.RT_ENV || 'dev';

/* default code */
const DEFAULT_CODE = 'I0000';

/* default descr message */
const DEFAULT_NO_DESCRIPTION_MESSAGE = 'no description';

const DEFAULT_SEVERITY = 'info';
const DEFAULT_TRACE_MESSAGE = 'no trace id';

var CONFIG_FILE_PATH = './config.'+ environment +'.json';
var APPLICATION_FILE_PATH = './application.json';
var configFile = require(CONFIG_FILE_PATH);
var applicationFile = require(APPLICATION_FILE_PATH);

/**
 * Set up logger.
 * This function will consume config file (config.<ENVIRONMENT>.json) to get logger
 * up and running.
 * -> Set up logger transporters
 */
function setup(){
    console.log("test");
    Object.keys(configFile['logging']).forEach(function(identifier){
        var type = configFile['logging'][identifier]['transport'].toLowerCase();
        var path = configFile['logging'][identifier]['path'];
        switch (type){
            case 'file': winston.add(winston.transports.File, { filename: path });
        }
    });
}

/**
 * @param code the message code. Codes are obtained from configuration file (config.<environment>.json)
 * @param req (OPTIONAL) the HTTP request that needs to be added as part of the log entry
 * @param params params (OPTIONAL) parameters required to configure dynamic message descriptions
 */
function log(code, req, params){
    code = _getCode(code);
    if(params && !(params instanceof Array)) params = [params];
    var description = _processDescription(code, params);
    winston.log(_getSeverity(code), new Date().toISOString() + '|' + code  + '|' + _getUuid(req) + '|' + description + '|' + _getRequest(req));
}

/**
 * @param code code the message code. Codes are obtained from configuration file (config.<environment>.json)
 * @param req req (OPTIONAL) the HTTP request that needs to be added as part of the log entry
 * @param params params (OPTIONAL) parameters required to configure dynamic message descriptions
 * @returns {Error}
 */
function error(code, req, params){
    log(code, req, params);

    var rtError = {};
    rtError.description = _processDescription(_getCode(code), params);
    rtError.date = new Date().toISOString();
    rtError.trace = _getUuid(req);

    return new Error(JSON.stringify(rtError));
}

/**
 * Given a request object, filter fields not required to be logged
 * @param req the HTTP request to be filtered
 * @private
 */
function _serializeRequest(req){
    return {
        body    : req.body,
        headers : req.headers,
        method  : req.method,
        params  : req.params,
        query   : req.query,
        uuid    : req.uuid
    }
}

/**
 * Given a message code and an array of parameters, interpolates params in description placeholders
 * based on array order. If no parameters provided, description is considered static
 * @param code the message code
 * @param params (OPTIONAL) the array of params
 * @returns {*}
 * @private
 */
function _processDescription(code, params){
    var position = 0;
    var description = applicationFile['codes'][code];
    if(!code || !description) return DEFAULT_NO_DESCRIPTION_MESSAGE;
    if(!params || !(params instanceof Array) || params.length == 0) return description;

    params.forEach(function(param){
        description = description.replace("%"+position, param);
        position++;
    });

    return description;
}

/**
 * gets message code. If no code provided, returns default value
 * @param code the message code
 * @private
 */
function _getCode(code){
    return code || DEFAULT_CODE;
}

/**
 * given a code, returns the severity associated to it
 * @param code the message code
 * @returns {*} the severity
 * @private
 */
function _getSeverity(code){
    if(!code || DEFAULT_CODE) return DEFAULT_SEVERITY;
    switch (code){
        case 'I': return 'info';
        case 'E': return 'error';
        default : return 'info';
    }
}

/**
 * Given an http request, extracts and returns UUID value.
 * @param req the HTTP request
 * @private
 */
function _getUuid(req){
    if(req && req.uuid) return req.uuid;
    return DEFAULT_TRACE_MESSAGE;
}

/**
 * Given an HTTP request object, returns the expected representation (filtering fields
 * not required to be logged or added to an error entry) or to return a default no http
 * message if no request provided
 * @param req the HTTP request
 * @returns {*}
 * @private
 */
function _getRequest(req){
    return req ? req = stringify(_serializeRequest(req)) : req = 'no request';
}

/**
 * Public Interface
 * @type {{setUp: setup, setup: setup, log: log, error: error, _processDescription: _processDescription}}
 */
module.exports = {
    setUp               : setup,
    setup               : setup,
    log                 : log,
    error               : error,
    _processDescription : _processDescription
};
