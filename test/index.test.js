var assert = require("assert");
var rtlog = require('../index');

describe('Test', function () {
        rtlog.setup();
        rtlog.log('E0000', {uuid:1334});
    }
);