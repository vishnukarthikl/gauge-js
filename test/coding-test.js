var assert = require('chai').assert;
var coding = require('../coding');
var ProtoBuf = require("protobufjs");
var ByteBuffer = require("bytebuffer");
var builder = ProtoBuf.loadProtoFile("gauge-proto/messages.proto");
var message = builder.build("gauge.messages.Message");

describe('coding', function () {
    describe('encoding and decoding', function () {
        it('should encode and decode messages', function () {
            var executeMessage = new message({
                messageId: 3,
                messageType: message.MessageType.ExecuteStep,
                executeStepRequest: {
                    actualStepText: 'say hello to gauge-js',
                    parsedStepText: 'say hello to gauge-js'
                }
            });
            var encoded = coding.encode(executeMessage);
            var actualMessage = coding.decodeMessage(encoded);
            assert.deepEqual(actualMessage.messageId, executeMessage.messageId);
            assert.deepEqual(actualMessage.messageType, executeMessage.messageType);
            assert.deepEqual(actualMessage.executeStepRequest.actualStepText,executeMessage.executeStepRequest.actualStepText);
            assert.deepEqual(actualMessage.executeStepRequest.parsedStepText,executeMessage.executeStepRequest.parsedStepText);
        });
    });
});