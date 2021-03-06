Error.stackTraceLimit = Infinity;

var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile("gauge-proto/messages.proto");
var message = builder.build("gauge.messages.Message");
var steps = require("./steps");
var Table = require("./table");

var messageProcessor = function () {
    var processors = {};
    processors[message.MessageType.StepNamesRequest] = doNothing;
    processors[message.MessageType.StepValidateRequest] = validateStep;
    processors[message.MessageType.ExecuteStep] = executeStep;
    processors[message.MessageType.SuiteDataStoreInit] = successExecutionStatus;
    processors[message.MessageType.SpecDataStoreInit] = successExecutionStatus;
    processors[message.MessageType.SpecExecutionStarting] = successExecutionStatus;
    processors[message.MessageType.ScenarioDataStoreInit] = successExecutionStatus;
    processors[message.MessageType.ScenarioExecutionStarting] = successExecutionStatus;
    processors[message.MessageType.StepExecutionStarting] = successExecutionStatus;
    processors[message.MessageType.StepExecutionEnding] = successExecutionStatus;
    processors[message.MessageType.ScenarioExecutionEnding] = successExecutionStatus;
    processors[message.MessageType.SpecExecutionEnding] = successExecutionStatus;
    processors[message.MessageType.ExecutionStarting] = successExecutionStatus;
    processors[message.MessageType.ExecutionEnding] = successExecutionStatus;
    return {
        process: function (request) {
            if (processors[request.messageType]) {
                return processors[request.messageType](request);
            } else {
                return doNothing(request);
            }
        }
    };
}();

function doNothing(request) {
    return request;
}

function successExecutionStatus(request) {
    return executionResponse(false, 0, request.messageId);
}

function validateStep(request) {
    var stepImpl = steps[request.stepValidateRequest.stepText];
    var response = null;
    if (stepImpl) {
        response = new message({
            messageId: request.messageId,
            messageType: message.MessageType.StepValidateResponse,
            stepValidateResponse: {
                isValid: true
            }
        });
    }
    else {
        response = new message({
            messageId: request.messageId,
            messageType: message.MessageType.StepValidateResponse,
            stepValidateResponse: {
                isValid: false,
                errorMessage: "Implementation not found"
            }
        });
    }
    return response;
}

function executeStep(request) {
    var stepImpl = steps[request.executeStepRequest.parsedStepText];
    var response = null;
    var startTime = new Date();

    function addStackTrace(executionResponse, stacktrace) {
        executionResponse.executionStatusResponse.executionResult.stackTrace = stacktrace;
    }

    if (stepImpl) {
        try {
            var args = request.executeStepRequest.parameters.map(function (p) {
                if (p.table) {
                    return new Table(p.table);
                }
                return p.value
            });
            if (args.length == 0)
                stepImpl();
            else
                stepImpl.apply(this, args);

            response = executionResponse(false, (new Date() - startTime), request.messageId)
        }
        catch (e) {
            response = executionResponse(true, (new Date() - startTime), request.messageId);
            if (e.stack) {
                addStackTrace(response, e.stack);
            }
        }
    }
    else {
        console.log("step not implemented");
    }
    return response;
}

function executionResponse(isFailed, executionTime, messageId) {
    return new message({
        messageId: messageId,
        messageType: message.MessageType.ExecutionStatusResponse,
        executionStatusResponse: {
            executionResult: {
                failed: isFailed,
                executionTime: executionTime
            }
        }
    });
}

module.exports = messageProcessor;