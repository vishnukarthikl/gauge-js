var gauge = require("./gauge");

gauge.step("say <greeting> to <person>", function (greeting, person) {
    console.log(greeting + "!!! " + person);
});

gauge.step("step with table <table>", function (table) {
    console.log(table.rowByIndex(1));
});