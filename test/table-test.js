var Table = require('../table');
var assert = require('chai').assert;
var should = require('chai').should;

describe('table', function () {
    describe('construction', function () {
        it('should create table with headers', function () {
            var protoTable = {
                headers: {cells: ['id', 'name']},
                rows: [{cells: ['1', 'vishnu']}, {cells: ['2', 'karthik']}]
            };
            var table = new Table(protoTable);
            assert.deepEqual(table.headers, ['id', 'name']);
        });
        it('should create table with rows', function () {
            var protoTable = {
                headers: {cells: ['id', 'name']},
                rows: [{cells: ['1', 'vishnu']}, {cells: ['2', 'karthik']}]
            };
            var table = new Table(protoTable);
            assert.deepEqual(table.rows, [['1', 'vishnu'], ['2', 'karthik']]);
        });
    });
    describe('should get row by index', function () {
        it('should get row by index', function () {
            var protoTable = {
                headers: {cells: ['id', 'name']},
                rows: [{cells: ['1', 'vishnu']}, {cells: ['2', 'karthik']}]
            };
            var table = new Table(protoTable);
            assert.deepEqual({
                id: '2',
                name: 'karthik'
            }, table.rowByIndex(1));
        });
        it('should return empty for invalid row index', function () {
            var protoTable = {
                headers: {cells: ['id', 'name']},
                rows: [{cells: ['1', 'vishnu']}, {cells: ['2', 'karthik']}]
            };
            var table = new Table(protoTable);
            assert.deepEqual(table.rowByIndex(4), {});
            assert.deepEqual(table.rowByIndex(-1), {});
        });
    });
    describe('all rows', function () {
        it('should get all the rows', function () {
            var protoTable = {
                headers: {cells: ['id', 'name']},
                rows: [{cells: ['1', 'vishnu']}, {cells: ['2', 'karthik']}]
            };
            var table = new Table(protoTable);
            assert.deepEqual(table.all(), [{
                id: '1',
                name: 'vishnu'
            }, {
                id: '2',
                name: 'karthik'
            }]);
        });
    });

});