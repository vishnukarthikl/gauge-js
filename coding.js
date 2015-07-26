var ByteBuffer = require("bytebuffer");
var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("gauge-proto/messages.proto");
var message = builder.build("gauge.messages.Message");
var apiBuilder = ProtoBuf.loadProtoFile("gauge-proto/api.proto");
var apiMessage = apiBuilder.build("gauge.messages.APIMessage");

function extractPayload(bytes) {
    var byteBuffer = ByteBuffer.wrap(bytes);
    var messageLength = byteBuffer.readVarint64(0);

    // Take the remaining part as the actual message
    return bytes.slice(messageLength.length, messageLength.value.low + messageLength.length);
}
var decodeMessage = function (bytes) {
    var data = extractPayload(bytes);
    return message.decode(data);
};

var decodeAPI = function (bytes) {
    var data = extractPayload(bytes);
    return apiMessage.decode(data);
};

var encode = function (data) {
    var payload = data.encode().toBuffer();

    // prefix message length
    var messageLengthByteBuffer = new ByteBuffer(ByteBuffer.calculateVarint64(payload.length));
    var length = messageLengthByteBuffer.writeVarint64(payload.length).flip().toBuffer();

    return ByteBuffer.concat([length, payload]);
};

module.exports = {
    decodeMessage: decodeMessage,
    decodeAPI: decodeAPI,
    encode: encode
};