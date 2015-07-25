var coding = require("./coding");
var messageProcessor = require("./message-processor");
var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("gauge-proto/messages.proto");
var message = builder.build("gauge.messages.Message");

function writeMessage(socket, response) {
    var toSend = coding.encode(response);
    socket.write(toSend.toBuffer());
}

var ExecutionConnection = function (host, port) {
    this.host = host;
    this.port = port;
    this.socket = require('net').Socket();
    this.messageHandler = function (d) {
        var request = coding.decode(d);
        if (request.messageType == message.MessageType.KillProcessRequest) {
            writeMessage(this, request);
            this.end();
        } else {
            var response = messageProcessor.process(request);
            writeMessage(this, response);
        }
    };
    this.socket.on('data', this.messageHandler);
};

ExecutionConnection.prototype.run = function () {
    this.socket.connect(this.port, this.host);
};

module.exports = ExecutionConnection;