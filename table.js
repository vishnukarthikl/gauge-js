var Table = function (protoTable) {
    if (protoTable == null) {
        throw "table can't be null";
    }
    this.headers = protoTable.headers.cells.map(function (header) {
        return header;
    });
    this.rows = protoTable.rows.map(function (row) {
        return row.cells;
    });
    this.rowByIndex = function (index) {
        var row = {};
        if (index > this.rows.length || index < 0) {
            return row;
        }
        for (var i = 0; i < this.headers.length; i++) {
            row[this.headers[i]] = this.rows[index][i];
        }
        return row;
    };

    this.all = function () {
        var rows = [];
        for (var i = 0; i < this.rows.length; i++) {
            rows.push(this.rowByIndex(i))
        }
        return rows;
    };

};

module.exports = Table;
