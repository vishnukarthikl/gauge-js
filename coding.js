var ByteBuffer = require("bytebuffer");
var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("gauge-proto/messages.proto");
var message = builder.build("gauge.messages.Message");

var decode = function (bytes) {
    var byteBuffer = ByteBuffer.wrap(bytes);
    var messageLength = byteBuffer.readVarint64(0);

    // Take the remaining part as the actual message
    var data = bytes.slice(messageLength.length, messageLength.value.low + messageLength.length);
    return message.decode(data);
};

var encode = function (data) {
    var payload = data.encode().toBuffer();

    // prefix message length
    var messageLengthByteBuffer = new ByteBuffer(ByteBuffer.calculateVarint64(payload.length));
    var length = messageLengthByteBuffer.writeVarint64(payload.length).flip().toBuffer();

    return ByteBuffer.concat([length, payload]);
};

module.exports = {
    decode: decode,
    encode: encode
};