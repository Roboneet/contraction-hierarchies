module.exports = Hierarchy;

var Graph = require("./Graph");
var DyPq = require("./DynamicPriorityQueue");

function Hierarchy(data){
	Graph.call(this, data);
}

Hierarchy.prototype = Object.create(Graph.prototype);

Hierarchy.prototype.query = function(a, b, interactive=false) {
	var s, t;
	// console.log(a, b)
	// console.log(this.level(a), this.level(b))
	if(this.level(a) < this.level(b)){
		s = a;t = b;
	}else{
		s = b;t = a;
	}

	// bidirectional dijkstra
	const valid = (curr, next) => {
		return (this.level(next) > this.level(curr));
	};

	var queues = [new DyPq(), new DyPq()];
	var distances = [new Object(), new Object()]
	var visited  = [new Object(), new Object()];
	var edgeTo = [new Object(), new Object()]
	var processed = [];
	var start = [s, t];
	var dest = [t, s];
	var interestingEdges = [];
	var boringEdges = [];
	var highlight = [];

	for(var i = 0; i < 2; i++){
		queues[i].insert(this.createEle(start[i], 0));
		// console.log("---", queues[i].queue)
		distances[i][start[i]] = 0; 
	}
	var meet;
	while((!queues[0].isEmpty() || !queues[1].isEmpty()) && meet == undefined){

		for(var i = 0; i<2; i++){
			if(!queues[i].isEmpty()){
				// console.log("i => ", i)
				var ele = queues[i].front();
				// console.log(ele)
				// console.log(ele, queues)
				queues[i].pop();
				if(processed.indexOf(ele) != -1 || ele == dest[i]){
					console.log("meet")
					meet = ele;
					break;
				}
				processed.push(ele);
				visited[i][ele] = true;
				// console.log(i, ele, "=> distance:", distances[i][ele]);
				
				var edges = this.getIncidentEdges(ele);
				
				for(var [k, m, d] of edges){

					if(visited[i][m] == undefined && valid(ele, m)){ 

						// console.log(this.level(ele),"=>", this.level(m), queues[i].queue)
						// console.log(i, ele, "=> distance to", m,":", distances[i][ele] + parseInt(d));
						this.relax(k, ele, m, parseInt(d) + distances[i][ele], i, distances, edgeTo, queues, this.estimate(m, dest[i]));
					}
					if(!valid(ele, m)){
						boringEdges.push(k);
					}else if(visited[i][m] == undefined){
						// console.log(i, "interesting =>", m);
						interestingEdges.push(k);
					}

				}
			}

		}
	}

	// console.log("meet at", meet, processed.length)

	var dist = 0;
	var path = [];
	if(meet){
		// console.log("meet !")
		var lengths = [];
		for(var n of processed){
			// console.log("processed => ", n, distances[0][n] , distances[1][n])
			if(distances[0][n]!=undefined && distances[1][n]!=undefined){
				lengths.push([distances[0][n] + distances[1][n], n]);
			}
		}
		lengths.sort(function(a, b){
			return a[0] - b[0];
		})

		// console.log(lengths);
		
		var m = lengths[0][1];
		dist = lengths[0][0];
		for(var i = m; i != s; i = edgeTo[0][i][0]){
			// console.log("path =>", edgeTo[0][i][1], "b/w", m, "&", edgeTo[0][i][0]);
			path.push(edgeTo[0][i][1])
		}

		for(var i = m; i != t; i = edgeTo[1][i][0]){
			// console.log("path =>", edgeTo[1][i][1], "b/w", m, "&", edgeTo[1][i][0])
			path.push(edgeTo[1][i][1])
		}
	}
	
	var obj = {dist, path};

	if(interactive){
		obj.visited = visited;
		obj.interestingEdges = interestingEdges;
		obj.boringEdges = boringEdges;
		obj.distances = distances;
	}
	return obj
};

Hierarchy.prototype.level = function(a){
	return this.data.nodes[a].level;
}

Hierarchy.prototype.interestingEdges = function(a){
	var base = this.data.nodes[a].level;
	var edges = this.data.nodes[a].edges;
	var list = [];
	for(var [k, m, _] of edges){
		if(this.level(m) > base){
			list.push(k);
		}
	}
	return list;
}

Hierarchy.prototype.relax = function(k, s, t, dist, side, distances, edgeTo, queues, est){
	// console.log(t, distances[side][t]);
	console.log(est);
	if(distances[side][t] == undefined){
		// console.log("new node found")
		distances[side][t] = dist;
		edgeTo[side][t] = [s, k];
		queues[side].insert(this.createEle(t, dist + est));
	}
	else if(distances[side][t] > dist){
		distances[side][t] = dist;
		edgeTo[side][t] = [s, k];
		queues[side].setProperty(t, "dist", dist + est);
	}
}

Hierarchy.prototype.createEle = function(s, dist){
	return new Ele(s, dist);
}

function Ele(s, dist){
	this.id = s;
	this.dist = dist;
	this.cost = function(){};
	this.valueOf = function(){return this.dist}
}


Hierarchy.prototype.resolvePath = function(path){
	// console.log("path => ", path)
	var oldEdges = [];
	for(var i of path){

		oldEdges = oldEdges.concat(this.getPath(i))
	}
	// console.log("real Path =>", oldEdges)
	var nodes = this.data.nodes;
	var edges = this.data.edges;
	var resolved = oldEdges.map((e)=>{
		var edge = edges[e];
		return [nodes[edge.nodes[0]].latLng,nodes[edge.nodes[1]].latLng]
	})
	return resolved;

	
}

Hierarchy.prototype.getPath =  function(i){
	// console.log(i, "=>", (this.data.edges[i].new))
	if(!this.data.edges[i].new)return [i];
	else{
		var c = this.data.edges[i].components;
		// console.log("components =>", c)
		return this.getPath(c[0]).concat(this.getPath(c[1]))
	}
}
