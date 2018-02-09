module.exports = ProcessGraph;

var Transform = require("stream").Transform
var util = require("util");

var DyPq = require("./DynamicPriorityQueue");
var ContractGraph = require("./ContractGraph");
var CandidateNode = require("./CandidateNode");

util.inherits(ProcessGraph, Transform);

function ProcessGraph(){
	Transform.call(this, {
		objectMode:true
	});
}

ProcessGraph.prototype._transform = function(data, encoding, processed){
	this.graph = new ContractGraph(data);
	var dpq = this.orderNodes();
	this.contractNodes(dpq);
	this.push(this.graph.getData());
	console.log("contracted Nodes =>", this.graph.getData().meta.contracted_nodes)
	console.log("new Edges =>", this.graph.getData().meta.new_edges)
	processed();
}

ProcessGraph.prototype.orderNodes = function(){
	// example ele in proiority queue corresponding to each node
	// {
	// 	id,
	// 	deleted_neighbours,
	// 	edge_difference,
	// 	valueOf
	// }
	function dc(e){
		console.log("-->",e)
		console.log(this.graph.isContracted(e))
	}
	var debugCallback = dc.bind(this)

	console.log("********* ORDER NODES ************");
	var dpq = new DyPq(["deleted_neighbours", "edge_difference"], debugCallback);
	var nodes = this.graph.getNodes();
	for(i in nodes){

		dpq.insert(new CandidateNode(i, this.graph));
		// console.log("order =>", dpq.length())
	}
	return dpq;
}

ProcessGraph.prototype.contractNodes = function(dpq){
	console.log("********* CONTRACT NODES ************");
	while(!dpq.isEmpty()){
		var e = dpq.front();
		if(dpq.length() % 10 == 0)
			console.log("contract =>", dpq.length())
		dpq.pop();
		this.graph.contract(e);
		var edges = this.graph.getIncidentEdges(e);
		for(var [___, ele, __] of edges){
			if(!this.graph.isContracted(ele)){
				dpq.setProperty(ele, "deleted_neighbours", dpq.getProperty(ele, "deleted_neighbours") + 1)
			}
		}
	}
}
