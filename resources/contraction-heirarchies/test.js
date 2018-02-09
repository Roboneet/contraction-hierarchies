/*******************
JUST FOR DEBUGGING
*******************/


var fs = require("fs");

var Graph = require("./Graph");
var ContGraph = require("./ContractGraph");
var Hierarchy = require("./Hierarchy");
var { GRAPH, CONTRACTED_GRAPH, DUMMY_DATA } = require("./constants");
var testQuery = require("./testQuery");


run();

function run(){
	// setUpGraph(CONTRACTED_GRAPH).then(g=>{
	// 	console.log(g.getIncidentEdges(118));
	// })
	// testGraphAstar(GRAPH, 1, 3);

	setUpHierarchy(CONTRACTED_GRAPH).then((hcy)=>{
		testQuery(hcy, 50, 100)
	}).catch((e)=>{
		console.log(e)
	})

	// setUpCGraph(CONTRACTED_GRAPH).then((c)=>{
	// 	c.contract(86)
	// })
}


function getDummyData(fileName){
	return new Promise(function(resolve, reject){
		var string = "";
		var file = fs.createReadStream(fileName)
		file.on("data", function(data){
			string += data.toString();
		})

		file.on("end", function(){
			resolve(JSON.parse(string));
		})

		file.on("error", function(err){
			reject(err);
		})
	})
}

function setUpGraph(fileName){
	return getDummyData(fileName).then((data)=>{
		return new Graph(data);
	});
}

function setUpCGraph(fileName){
	return getDummyData(fileName).then((data)=>{
		return new ContGraph(data);
	});
}

function testGraphAstar(fileName, s, t){
	setUpGraph(fileName).then((g)=>{
		console.log(g.Astar(s, t), g.estimate(s, t))
	}).catch(function(e){
		console.log("Error ", e);
	})
}

function testCGraphAstar(fileName, s, t){
	setUpCGraph(fileName).then((g)=>{
		console.log(g.Astar(s, t, true))
	}).catch(function(e){
		console.log("Error ", e);
	})
}

function setUpHierarchy(fileName){
	return getDummyData(fileName).then((data)=>{
		return new Hierarchy(data);
	});
}