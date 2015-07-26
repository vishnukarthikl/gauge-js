var gauge = require("./gauge");

gauge.step("say <greeting> to <person>", function (greeting, person) {
    console.log(greeting + "!!! " + person);
});