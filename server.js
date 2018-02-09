var engines = require('consolidate');
var fs = require("fs");
var express = require('express');
var CGraph = require('./resources/contraction-heirarchies/ContractGraph.js');
var HGraph = require('./resources/contraction-heirarchies/Hierarchy.js');
var app = express();
var bodyParser = require('body-parser')

app.use( bodyParser.json() )
app.use('/static',express.static(__dirname + '/public'));
app.use(express.json());
app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(8080, '127.0.0.1', function(){
	process.stdout.write('listening on 127.0.0.1:8080');
})


app.get('/map', function (req, res, next) {

  var options = {
    root: __dirname + '/public/',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  // var fileName = req.params.name;
  res.sendFile('/geojson/map_extract.geojson', options, function (err) {
    if (err) {

      next(err);
    } else {
      console.log('Sent map');
    }
  });

});


var CG = undefined;
var HG = undefined;
app.get('/testCH', function(req, res){
  setUpGraph().then(()=>{
    res.render('ch.html');
  }).catch(console.log)
})

app.get('/testCH/nodes/', function(req, res){
    var data = CG.getNodes();
    res.send(JSON.stringify(data));
})

app.get('/testCH/graph/', function(req, res){
    var data = CG.getGraph();
    res.send(JSON.stringify(data));
})

app.get('/testCH/Cgraph/', function(req, res){
    fs.readFile('./resources/contraction-heirarchies/contractedGraph.json', function(err, data){
      if(err)reject();
      
      var k = new CGraph(JSON.parse(data.toString()), false);
      var data = k.getGraph();
      res.send(JSON.stringify(data));  
    });
})

app.post('/testCH/edge/', function(req, res){
    var edgeId = req.body.edgeId;
    // console.log("/testCH/edge/ =>", edgeId)
    var data = CG.getEdge(edgeId);
    // console.log("=>", data)
    res.send(JSON.stringify(data));
})

app.post('/testCH/node/', function(req, res){
    var nodeId = req.body.nodeId;
    var data = CG.getNode(nodeId);
    res.send(JSON.stringify(data));
})



app.post('/testCH/contract', function(req ,res){
  var nodeId = req.body.node;
  // console.log("request @testCH/contract", nodeId);
  if(CG == undefined){
    console.log("CG =>", CG);
    setUpGraph.then(()=>{contract(nodeId)})
  }else{
    contract(nodeId)
  }

  function contract(){
    CG.contract(nodeId);
    var s = CG.shortcuts(nodeId);
    // console.log("shortcuts", s);
    res.send(JSON.stringify({"newEdges":s}));
  }
})

app.post('/testCH/query', function(req, res){
  var origin = req.body.origin;
  var dest = req.body.dest;
  if(HG == undefined){
    setUpHierarchy().then(query);
  }else{
    query();
  }

  function query(){
    var obj = HG.query(origin.key, dest.key, true)
    res.send(JSON.stringify(obj));
  }

})

app.post('/testCH/intEdges', function(req, res){
  var nodeId = req.body.nodeId;
  if(HG == undefined){
    setUpHierarchy().then(intEdges);
  }else{
    intEdges();
  }

  function intEdges(){
    res.send(JSON.stringify({intEdges:HG.interestingEdges(nodeId)}));
  }
})

app.post('/testCH/level/', function(req, res){
  var nodeId = req.body.nodeId;
  if(HG == undefined){
    setUpHierarchy().then(intEdges);
  }else{
    intEdges();
  }

  function intEdges(){
    res.send(JSON.stringify({level:HG.level(nodeId)}));
  }
})

app.post('/testCH/origPath/', function(req, res){
  var path = req.body.path;
  if(HG == undefined){
    setUpHierarchy().then(getPath);
  }else{
    getPath();
  }

  function getPath(){
    res.send(JSON.stringify({path:HG.resolvePath(path)}));
  }
})

function setUpGraph(){
  if(CG != undefined)return new Promise(function(r, e){r()});
  return new Promise(function(resolve, reject){
    fs.readFile('./resources/contraction-heirarchies/graph.json', function(err, data){
      if(err)reject();
      
      CG = new CGraph(JSON.parse(data.toString()));
      
      resolve();
    });
  });
}

function setUpHierarchy(){
  console.log("contract")
  if(HG != undefined)return new Promise(function(r, e){r()});
  return new Promise(function(resolve, reject){
    fs.readFile('./resources/contraction-heirarchies/contractedGraph.json', function(err, data){
      if(err)reject();
      
      HG = new HGraph(JSON.parse(data.toString()));
      CG = new CGraph(JSON.parse(data.toString()), false);
      resolve();
    });
  });
}