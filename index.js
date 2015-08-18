var winston = require('winston');
var stringify = require('json-stringify-safe');
var environment = process.env.RT_ENV || 'dev';

var CONFIG_FILE_PATH = './config.'+ environment +'.json';
var configFile = require(CONFIG_FILE_PATH);


function setup(){
    Object.keys(configFile['logging']).forEach(function(identifier){
        var type = configFile['logging'][identifier]['transport'].toLowerCase();
        var path = configFile['logging'][identifier]['path'];
        switch (type){
            case 'file': winston.add(winston.transports.File, { filename: 'application.log' });
        }
    });
}

/**
 * @param code
 * @param req
 * @params params
 * @constructor
 */
function log(code, req, params){
    if(params && !(params instanceof Array)) params = [params];
    var trace = req.uuid;
    code = code || 'I0000';
    var severity;
    switch (code[0]){
        case 'I': severity = 'info'; break;
        case 'E': severity = 'error'; break;
        default : severity = 'info'; break;
    }
    var isoDate = new Date();
    isoDate = isoDate.toISOString();
    req ? req = stringify(_serializeRequest(req)) : req = 'no request';
    var description = _processDescription(code);
    winston.log(severity, isoDate + '|' + code  + '|' + trace + '|' + description + '|' + req);
}

/**
 * Lets just add the fields we are interested to log from the request and rip the rest
 * @param req
 * @returns {{body: *, headers: (req.headers|{Content-Type}), method: string, params: *, query: *}}
 * @private
 */
function _serializeRequest(req){
    return {
        body : req.body,
        headers : req.headers,
        method : req.method,
        params : req.params,
        query : req.query
    }
}

function _processDescription(code){
    return "TBD: " + code;
    //typeof LOG_CODES[code] == 'function' ? LOG_CODES[code](params) : LOG_CODES[code];
}

module.exports = {
    setUp : setup,
    setup : setup,
    log   : log
};