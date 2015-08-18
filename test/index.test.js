var assert = require("assert");
var rtlog = require('../index');

describe('Tests', function () {
        it('should correctly set up logger', function () {
            try {
                rtlog.setup();
            } catch (error) {
                assert.fail()
            }
        });

        it('should correctly parse a description with one variable placeholder', function () {
            try {
                var description = rtlog._processDescription('I0001', ['1234']);
                assert(description.indexOf('1234') > -1);
            } catch (error) {
                assert.fail()
            }
        });

        it('should correctly parse a description with two variable placeholders', function () {
            try {
                var description = rtlog._processDescription('I0003', ['LEFT VALUE', 'RIGHT VALUE']);
                assert(description.indexOf('LEFT VALUE') > -1);
                assert(description.indexOf('RIGHT VALUE') > -1);
            } catch (error) {
                assert.fail()
            }
        });
    }
);
