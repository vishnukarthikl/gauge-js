#! /usr/bin/env node

var ProtoBuf = require("protobufjs");
var ByteBuffer = require("bytebuffer");
var flags = require("flags");
var messageProcessor = require("./message-processor");
var steps = require("./steps");
var coding = require("./coding");

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
    var socket = require('net').Socket();
    socket.connect(process.env.GAUGE_INTERNAL_PORT, 'localhost');
    socket.on('data', function (d) {
        var request = coding.decode(d);
        if (request.messageType == message.MessageType.KillProcessRequest) {
            writeResponse(socket, request);
            socket.end();
        } else {
            var response = messageProcessor.process(request);
            writeResponse(socket, response);
        }
    });
} else {
    throw "should pass init or start flag"
}

function isInit() {
    return flags.get('init');
}
function isStart() {
    return flags.get('start');
}

function writeResponse(socket, response) {
    var toSend = coding.encode(response);
    socket.write(toSend.toBuffer());
}