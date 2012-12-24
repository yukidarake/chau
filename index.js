var fs = require('fs');
var difflet = require('difflet');
var deepEqual = require('deep-equal');

if (process.argv.length < 4) {
    console.log('usage: chau a.json b.json');
    process.exit(1);
}

var read = function(file) {
    return fs.readFileSync(file, 'utf8')
        .split(/\n/)
        .filter(function(line) {
            return line;
        })
        .reduce(function(map, line) {
            var obj = JSON.parse(line);
            map[obj._id] = obj;
            return map;
        }, {});
};

var diff = difflet({
    indent:2,
    comment: true
});

var prev = read(process.argv[2]);
var next = read(process.argv[3]);

Object.keys(prev).forEach(function(key) {
    if (deepEqual(prev[key], next[key])) {
        delete prev[key];
        delete next[key];
    }
});

Object.keys(next).forEach(function(key) {
    if (deepEqual(next[key], prev[key])) {
        delete prev[key];
        delete next[key];
    }
});

console.log(diff.compare(prev, next));

