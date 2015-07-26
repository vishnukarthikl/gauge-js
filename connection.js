var coding = require("./coding");
var messageProcessor = require("./message-processor");
var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("gauge-proto/messages.proto");
var apiBuilder = ProtoBuf.loadProtoFile("gauge-proto/api.proto");
var message = builder.build("gauge.messages.Message");
var apiMessage = apiBuilder.build("gauge.messages.APIMessage");

function writeMessage(socket, response) {
    var toSend = coding.encode(response);
    socket.write(toSend.toBuffer());
}

var ExecutionConnection = function (host, port) {
    this.host = host;
    this.port = port;
    this.socket = require('net').Socket();
    this.run = function () {
        this.socket.connect(this.port, this.host);
    };
    this.messageHandler = function (d) {
        var request = coding.decodeMessage(d);
        if (request.messageType == message.MessageType.KillProcessRequest) {
            writeMessage(this, request);
            this.end();
            process.exit();
        } else {
            var response = messageProcessor.process(request);
            writeMessage(this, response);
        }
    };
    this.socket.on('data', this.messageHandler);
};

var ApiConnection = function (host, port) {
    this.host = host;
    this.port = port;
    this.sendStepValueRequest = function (actualText, callback) {
        var socket = require('net').Socket();
        socket.connect(port, host);
        var request = new apiMessage({
            messageId: 1,
            messageType: apiMessage.APIMessageType.GetStepValueRequest,
            stepValueRequest: {
                stepText: actualText
            }
        });
        var requestBuffer = coding.encode(request).toBuffer();
        socket.on('data', function (d) {
            var data = coding.decodeAPI(d);
            var response = data.stepValueResponse;
            callback(response.stepValue);
        });
        socket.write(requestBuffer);
    };
};

module.exports = {
    ExecutionConnection: ExecutionConnection,
    ApiConnection: ApiConnection
};