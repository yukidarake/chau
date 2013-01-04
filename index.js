var fs = require('fs');

var async = require('async');
var difflet = require('difflet');
var deepEqual = require('deep-equal');
var request = require('request');

if (process.argv.length < 4) {
    console.log('usage: chau a.json b.json');
    console.log('   or: chau http://example.com/a.json http://example.com/b.json');
    process.exit(1);
}

var parse = function(data) {
    try {
        var lines = (data || '')
            .split(/\n/)
            .filter(function(line) {
                return line;
            });

        if (lines.length === 1) {
            return JSON.parse(lines);
        }

        return lines.reduce(function(map, line) {
            var obj = JSON.parse(line);
            map[obj._id] = obj;
            return map;
        }, {});

    } catch(e) {
        return JSON.parse(data);
    }
};

var read = function(path, callback) {
    if (/^http/.test(path)) {
        request(path, function(err, res, body) {
            if (err) {
                throw err;
            }

            callback(null, parse(body));
        });
        return;
    }

    fs.readFile(path, 'utf8', function(err, data) {
        if (err) {
            throw err;
        }

        callback(null, parse(data));
    });
};


var diff = difflet({
    indent:2,
    comment: true
});

async.parallel({
    prev: function(next) {
        read(process.argv[2], next);
    },
    next: function(next) {
        read(process.argv[3], next);
    },
}, function(err, data) {
    var prev = data.prev;
    var next = data.next;

    Object.keys(prev).forEach(function(key) {
        if (deepEqual(prev[key], next[key])) {
            delete prev[key];
            delete next[key];
        }
    });

    console.log(diff.compare(prev, next));
});

