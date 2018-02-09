module.exports = OutStream;

var fs = require("fs");
var Transform = require("stream").Transform
var util = require("util");
util.inherits(OutStream, Transform);

function OutStream(fileName){

	Transform.call(this, {
		objectMode:true
	});

	this.fileName = fileName;
}

OutStream.prototype._transform = function(data, encoding, processed){
	var out = fs.createWriteStream(this.fileName);
	out.write(JSON.stringify(data));
}