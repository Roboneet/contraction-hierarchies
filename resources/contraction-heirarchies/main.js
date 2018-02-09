var fs = require("fs");
var split = require("split");


var ReadGraph = require('./ReadGraph');
var ProcessGraph = require('./ProcessGraph');
var OutStream = require('./OutStream');
var { SMALL_INPUT, LARGE_INPUT, CONTRACTED_GRAPH, GRAPH  } = require("./constants.js")

var file = fs.createReadStream(SMALL_INPUT);

file
.pipe(split())
.pipe(new ReadGraph())
.pipe(new ProcessGraph())
.pipe(new OutStream(CONTRACTED_GRAPH))

