#! /usr/bin/env node

var ProtoBuf = require("protobufjs");
var ByteBuffer = require("bytebuffer");
var flags = require("flags");
var steps = require("./steps");
var ExecutionConnection = require("./connection");
var builder = ProtoBuf.loadProtoFile("gauge-proto/messages.proto");
var message = builder.build("gauge.messages.Message");

flags.defineBoolean('init');
flags.defineBoolean('start');
flags.parse();

module.exports.step = function (steptext, callback) {
    steps[steptext] = callback;
};
require('./step_implementation');


if (isInit()) {
    console.log("init");
} else if (isStart()) {
    var executionConnection = new ExecutionConnection('localhost', process.env.GAUGE_INTERNAL_PORT);
    executionConnection.run();
} else {
    throw "should pass init or start flag"
}

function isInit() {
    return flags.get('init');
}
function isStart() {
    return flags.get('start');
}
