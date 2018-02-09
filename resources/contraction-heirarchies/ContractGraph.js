module.exports = ContractGraph;

var Graph = require('./Graph')

function ContractGraph(data, setup=true){
	Graph.call(this, data);
	if(setup){
		for( var i in this.data.nodes){
			this.data.nodes[i].contracted = false;
			this.data.nodes[i].level = undefined;
			this.data.nodes[i].shortcuts = [];
		}
		for(var i in this.data.edges){
			this.data.edges[i].new = false;
		}

		this.data.meta.contracted_nodes = 0;
		this.data.meta.new_edges = 0;
	}
	this.dummy =0 ;

}

ContractGraph.prototype = Object.create(Graph.prototype);

ContractGraph.prototype.Astar = function(s, t, debug=false){
	var cond = this.isContracted.bind(this);
	var valid = (k)=>{ return !((cond)(k))};
	
	return Graph.prototype.Astar.call(this, s, t, valid, debug);
}

ContractGraph.prototype.isContracted = function(s){
	return this.data.nodes[s]["contracted"]
}

ContractGraph.prototype.setContracted = function(s){
	this.data.nodes[s]["contracted"] = true;
}

ContractGraph.prototype.unsetContracted = function(s){
	this.data.nodes[s]["contracted"] = false;
}
ContractGraph.prototype.setLevel = function(s){
	this.setContracted(s);
	this.data.nodes[s]["level"] = this.data.meta.contracted_nodes + 1;
	this.data.meta.contracted_nodes = this.data.meta.contracted_nodes + 1;
}

ContractGraph.prototype.contract = function(c){
	// console.log("c =>", c)

	if(this.data.nodes[c].contracted)return;
	this.setLevel(c);
	var edges = this.getIncidentEdges(c).slice(0);
	// console.log(edges)
	this.dummy = 0;
	for(var k in edges){
		var [aKey, s, l1] = edges[k];
		if(!this.isContracted(s)){
			for(var i=parseInt(k)+1; i<edges.length; i++){
				var [bKey, t, l2] = edges[i];
				if(t != s && !this.isContracted(t)){
					var { dist, direct } = this.Astar(s, t, false);
					if(dist == Infinity){
						// console.log(s, t, this.dummy)
					}
					// console.log(s, t, dist)
					if(dist >= l1 + l2){
						this.dummy = this.dummy + 1;
						// console.log("contract ", s, " ,", t, "with",l1 + l2, "instead of", dist);
						this.addNewEdge(s, t, l1 + l2, direct, [aKey, bKey], c);
					}
				}
			}
		}
	}
	// console.log(c, '=>', this.dummy)
}

ContractGraph.prototype.addNewEdge = function(s, t, dist, direct, components, c){
	var k;
	if(s == t){
		// console.log(s,t, "eee")
		return;
	}
	
	
	var edges = this.data.nodes[s].edges;
	for(var i in edges){
		var [key, l, __] = edges[i];
		if(l == t){
			k = key
			this.setDistance(key, dist);
		}
	}
	if(k == undefined)
		k = this.addEdge(s, t, dist);
	

	this.data.edges[k].new = true;
	this.data.edges[k].components = components;
	this.data.meta.new_edges = this.data.meta.new_edges + 1;
	this.data.nodes[c].shortcuts.push(k);
}

ContractGraph.prototype.contractionComplete = function() {
	for(var n of Object.keys(this.data.nodes))
		if(!this.data.nodes[n].contracted){
			return false;
		}
		return true;
	};

	ContractGraph.prototype.shortcuts = function(s){
		return this.data.nodes[s].shortcuts;
	}

