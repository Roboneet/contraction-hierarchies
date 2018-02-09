module.exports = CandidateNode;
function CandidateNode(id, graph){
	// console.log(id)
	this.id = id;
	this.deleted_neighbours = 0;
	this.edge_difference = 0;
	
	this.graph = graph;
}


// calculate the variables
CandidateNode.prototype.cost = function(){
	//calculate Edge Diffrence
	var shortcuts = 0;
	this.graph.setContracted(this.id);
	var edges = this.graph.getIncidentEdges(this.id);
	for(var k in edges){
		var [__, s, l1] = edges[k];
		if(!this.graph.isContracted(s)){
			for(var i=parseInt(k)+1; i<edges.length; i++){
				var [___, t, l2] = edges[i];
				if(!this.graph.isContracted(t)){
					var { dist, direct } = this.graph.Astar(s, t);
					if(dist > l1 + l2){
						shortcuts++;
					}
				}
			}
		}
	}
	this.graph.unsetContracted(this.id);
	this.edge_difference = shortcuts - edges.length;
	// console.log("calculate Edge Diffrence of node", this.id , "edge diffrence:", this.edge_difference);
	
}

CandidateNode.prototype.valueOf = function(){
	// console.log(this.edge_difference, this.deleted_neighbours);
	return this.edge_difference + this.deleted_neighbours;
}


