#! /usr/bin/env node

var ProtoBuf = require("protobufjs");
var ByteBuffer = require("bytebuffer");
var flags = require("flags");

var builder = ProtoBuf.loadProtoFile("gauge-proto/messages.proto");
var message = builder.build("gauge.messages.Message");

flags.defineBoolean('init');
flags.defineBoolean('start');
flags.parse();


if (isInit()) {
    console.log("init");
} else if (isStart()) {
    var messageProcessor = {};
    messageProcessor[message.MessageType.StepNamesRequest] = function (request) {
        return request;
    };
    messageProcessor[message.MessageType.StepValidateRequest] = function (request) {
        return new message({
            messageId: request.messageId, messageType: message.MessageType.StepValidateResponse, stepValidateResponse: {
                isValid: true
            }
        });
    };

    var socket = require('net').Socket();
    socket.connect(process.env.GAUGE_INTERNAL_PORT, 'localhost');
    socket.on('data', function (d) {
        var bb = ByteBuffer.wrap(d);
        var messageLength = bb.readVarint64(0);

        // Take the remaining part as the actual message
        var data = d.slice(messageLength.length, messageLength.value.low + 1);
        var request = message.decode(data);
        if (request.messageType == message.MessageType.KillProcessRequest) {
            writeResponse(socket, request);
            socket.end();
        } else {
            var response = messageProcessor[request.messageType](request);
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
    var payload = response.encode().toBuffer();

    // prefix message length
    var messageLengthByteBuffer = new ByteBuffer(ByteBuffer.calculateVarint64(payload.length));
    var length = messageLengthByteBuffer.writeVarint64(payload.length).flip().toBuffer();

    var toSend = ByteBuffer.concat([length, payload]);
    socket.write(toSend.toBuffer());
}