module.exports = Graph;

var DyPq = require("./DynamicPriorityQueue");

function Graph(data){
	this.data = data;
	if(this.data.meta == undefined){
		this.data.meta = {};
	}else if(this.data.nodes == undefined){
		this.data.nodes = {};
	}else if(this.data.edges == undefined){
		this.data.edges = {};
	}


}

Graph.prototype.getData = function(){
	return this.data
}

Graph.prototype.Astar = function(s, t, valid=()=>{return true}, debug=false) {
	
	// var visited = {};
	// var distances = {};
	// var edgeTo = {};
	// var queue = new DyPq(["dist"]);
	// queue.insert(new Ele(s, 0));
	// distances[s] = 0;
	// var count = 0;
	// while(!queue.isEmpty()){
		
		
	// 	var eid = queue.front();
	// 	queue.pop();
	// 	visited[eid] = true;
		
	// 	if(eid == t){
	// 		// Route Found
	// 		console.log("route found")
	// 		break;
	// 	}
		
	// 	var edges = this.data.nodes[eid]["edges"]
	// 	// console.log(eid, edges)
	// 	if(debug){
	// 		count++;
	// 		// console.log(eid, edges)
	// 		for(var i in this.data.nodes){
	// 			if(this.data.nodes[i].contracted)
	// 				console.log("contracted", i);
	// 		}
	// 		// if(count == 2)
	// 		// 	process.exit();
	// 	}
	// 	for(var i in edges){
	// 		var [__, m, d ] = edges[i]

	// 		if(visited[m] == undefined && valid(m)){
	// 			// console.log(distances[eid])
	// 			relax(eid, m, d + distances[eid], 0, debug);
	// 		}
	// 	}
	// }
	
	// if(edgeTo[t] == undefined)return {dist:Infinity};
	// var dist = 0;
	// for(var i = t; i != s; i = edgeTo[i]){
	// 	dist += parseInt(distances[i]);
	// }
	// return {dist, direct: (edgeTo[t] == s)};
	
	// function relax(s, t, dist, estm, debug){
	// 	// console.log(s, t, dist, estm)
	// 	if(distances[t] == undefined){
	// 		distances[t] = dist;
	// 		edgeTo[t] = s;
	// 		queue.insert(new Ele(t, dist + estm));
	// 	}
	// 	else if(distances[t] > dist){
	// 		distances[t] = dist;
	// 		edgeTo[t] = s;
	// 		queue.setProperty(t, "dist", dist + estm);
	// 	}
	// }

	// function Ele(s, dist){
	// 	this.id = s;
	// 	this.dist = dist;
	// 	this.cost = function(){}
	// 	this.valueOf = function(){return this.dist};
	// }
	// var direction = [false, true] // go up the heirarchy or down, represents (level(nextNode) < level(currNode))
	// const valid = (curr, next, dir) => {
	// 	// if(this.level(next) == this.level(curr))console.log(curr, next,"eee");
	// 	return (this.level(next) < this.level(curr)) == direction[dir];
	// };

	var queues = [new DyPq(), new DyPq()];
	var distances = [new Object(), new Object()]
	var visited  = [new Object(), new Object()];
	var edgeTo = [new Object(), new Object()]
	var processed = [];
	var start = [s, t];
	var dest = [t, s];

	for(var i = 0; i < 2; i++){
		queues[i].insert(new Ele(start[i], 0));
		distances[i][start[i]] = 0; 
	}
	var meet;
	while((!queues[0].isEmpty() || !queues[1].isEmpty()) && meet == undefined){

		for(var i = 0; i<2; i++){
			if(!queues[i].isEmpty()){
				// console.log("i => ", i)
				var ele = queues[i].front();
				// console.log(ele, queues)
				queues[i].pop();
				visited[i][ele] = true;
				if(processed.indexOf(ele) != -1){
					// console.log("meet")
					meet = ele;
					break;
				}
				processed.push(ele);
				
				
				var edges = this.getIncidentEdges(ele);
				// console.log(i.toString(), queues[i].length().toString(), ele.toString(),"=>",edges.map(e=>e[1]).filter(e=>valid(ele, e, i)).join(", "));
				for(var [_, m, d] of edges){

					if(visited[i][m] == undefined && valid(ele, m, i)){ 
						relax(ele, m, parseFloat(d) + distances[i][ele], i, this.estimate(m, dest[i]));
					}
				}
			}

		}
	}
	if(meet == undefined){
		console.log("didn't meet")
		return {dist:Infinity, direct:false}
	}

	var distPQ = new DyPq();
	// console.log(processed, meet)
	var calcd = {};
	
	for(var i of processed){
		if(distances[0][i] != undefined && distances[1][i] != undefined){
			// console.log(i + "=> " + distances[0][i] , distances[1][i])
			var d = distances[0][i] + distances[1][i];
			calcd[i] = d;
			distPQ.insert(new Ele(i, d))
		}
	}
	var id = distPQ.front();
	var dist = calcd[id.toString()];
	// console.log(dist);
	return {dist, direct: (edgeTo[0][t] == s)}


	function relax(s, t, dist, side, estm){
		// console.log(estm)
		// console.log("relax", s, t, dist)
		if(distances[side][t] == undefined){
			// console.log("new node found")
			distances[side][t] = dist;
			edgeTo[side][t] = s;
			queues[side].insert(new Ele(t, dist + estm));
		}
		else if(distances[side][t] > dist){
			distances[side][t] = dist;
			edgeTo[side][t] = s;
			queues[side].setProperty(t, "dist", dist + estm);
		}
	}

	function Ele(s, dist){
		this.id = s;
		this.dist = dist;
		this.cost = function(){};
		this.valueOf = function(){return this.dist}
	}
};

Graph.prototype.estimate = function(s, t){
	return this.calcDistance(this.data.nodes[s].latLng, this.data.nodes[t].latLng);
}

Graph.prototype.getNodes = function(){
	return this.data.nodes;
}

Graph.prototype.getIncidentEdges = function(s){
	// console.log("edges of =>", s);
	// console.log(this.data.nodes[s].edges)

	return this.data.nodes[s].edges;
}


Graph.prototype.getEdge = function(e){
	// console.log(e ,"len =>", this.data.meta.number_of_edges)
	return this.data.edges[e];
}

Graph.prototype.getNode = function(s){
	return this.data.nodes[s];
}

Graph.prototype.addEdge = function(s, t, distance){
	var key = this.data.meta.number_of_edges + 1; 
	var value = {
		id: key,
		nodes: [s, t],
		distance
	}
	this.data["edges"][key] = value;
	this.data["nodes"][s]["edges"].push([key, t, distance]);
	this.data["nodes"][t]["edges"].push([key, s, distance]);
	this.data.meta.number_of_edges = key;
	return key;
}

Graph.prototype.setDistance = function(eid, dist){
	var old = this.data.edges[eid].distance;
	var [s, t] = this.data.edges[eid]["nodes"];
	var i = this.data.nodes[s]["edges"].indexOf([eid, t, old]);
	this.data.nodes[s]["edges"][i] = [eid, t, dist];
	var j = this.data.nodes[t]["edges"].indexOf([eid,s, old]);
	this.data.nodes[s]["edges"][j] = [eid, s, dist];
	this.data.edges[eid].distance = dist;
}


Graph.prototype.calcDistance = function(latLng1, latLng2){
	var lat1 = latLng1.lat;
	var lat2 = latLng2.lat;
	var lon1 = latLng1.lng;
	var lon2 = latLng2.lng;

	var R = 6371; // Radius of the earth in km
  	var dLat = deg2rad(lat2-lat1);  // deg2rad below
  	var dLon = deg2rad(lon2-lon1); 
  	// console.log(lat1, lat2, dLat, dLon)
  	var a = 
  	Math.sin(dLat/2) * Math.sin(dLat/2) +
  	Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  	Math.sin(dLon/2) * Math.sin(dLon/2); 
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  	var d = R * c; // Distance in km
  	
  	return d*1000;

  	function deg2rad(deg){
  		return deg*Math.PI/180;
  	}
}

Graph.prototype.getGraph = function(){
	var k = this.data.nodes;
	var graph = JSON.parse(JSON.stringify(this.data.edges));
	for( var v in graph ){
		graph[v].coordinates = [];
		graph[v].nodes.forEach((id)=>{
			graph[v].coordinates.push(k[id].latLng);
		})
	}
	return graph;
}