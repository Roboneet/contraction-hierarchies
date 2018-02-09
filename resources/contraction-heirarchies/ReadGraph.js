module.exports = ReadGraph;

var Transform = require("stream").Transform
var util = require("util");

var Graph = require("./Graph");

util.inherits(ReadGraph, Transform);

function ReadGraph(){
	Transform.call(this, {
		objectMode:true
	});
	this.data = {
		meta: {

		},
		nodes:{
			// <id>:{<data>}
		},
		edges:{
			// <id> = {<data>}
		}


	};
	this.state = "skip";
	this.lines = 7;
}

ReadGraph.prototype.nextState = function(){
	switch(this.state){
		case "skip":
		this.state = "meta";
		this.lines = 2;
		process.stdout.write("reading "+this.state+ "\n");
		break;
		case "meta":
		
		this.state = "nodes";
		this.lines = parseInt(this.data["meta"]["number_of_nodes"]);
		this.processLine = this.processNode;
		process.stdout.write("reading " + this.lines +" "+ this.state + "\n");
		break;
		case "nodes":

		this.state = "edges";
		this.lines = parseInt(this.data["meta"]["number_of_edges"]);
		this.processLine = this.processEdge;
		process.stdout.write("reading " + this.lines +" "+ this.state + "\n");
		break;
		case "edges":
		this.state = "done";
		process.stdout.write("done reading\n");
		break;
		case "done":
		default:
		this.state = "skip";
	}
}

ReadGraph.prototype._transform = function(line, encoding, processed){
	switch(this.state){
		case "skip":
		break;
		case "meta":
		if(this.lines == 2){
			this.data["meta"].number_of_nodes = parseInt(line);
		}else if(this.lines == 1){
			this.data["meta"].number_of_edges = parseInt(line);
		}
		break;
		case "nodes":
		case "edges":
		this.processLine(line);

		default:

	}
	this.lines--;
	if(this.lines == 0){
		this.nextState();
	}
	if(this.state == "done"){
		this.nextState();
		this.push(this.data);

	}
	processed();
}

ReadGraph.prototype.processNode = function(line){

	var [key, lat , lng] = line.split(" ");
	var value = {
		latLng:{
			"lat":parseFloat(lat),
			"lng":parseFloat(lng)
		},
		edges:[]
	}
	this.data[this.state][key] = value;
	
	
}

ReadGraph.prototype.processEdge = function(line){
	var funcs = [parseInt, parseInt, parseFloat]
	var [s, t, distance] = line.split(" ").slice(0, 3).map((w, i)=>{ return funcs[i](w)});
	if(s ==t)
		console.log(s, t)
	var key = this.lines;
	
	var value= {
		id: key,
		nodes:[s, t],
		distance 
	}
	
	this.data[this.state][key] = value;
	this.data["nodes"][s]["edges"].push([key, t, distance]);
	this.data["nodes"][t]["edges"].push([key, s, distance]);
}
