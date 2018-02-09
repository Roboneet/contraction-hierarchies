var query = {
  origin : {},
  dest : {}
}

$("#msg").fadeOut();

var colors = {
  green: "#0f0",
  red: "#f00",
  blue: "#00f",
  white: "#fff",
  black: "#000",
  pink:  "#da3c3c"
}

var nodeStyle =  new ol.style.Style({
  image: new ol.style.Icon(({
    anchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: 'static/img/icon3.png',
    scale: .005,
    zIndex: 500
  })),
})
,labelStyle = new ol.style.Style({
  image: new ol.style.Icon(({
    anchor: [0.5, 500],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: 'static/img/icon4.svg',
    scale: .05,
    zIndex: 500
  })),
})
,cnodeStyle =  new ol.style.Style({
  image: new ol.style.Icon(({
    anchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: 'static/img/icon.png',
    scale: .08,
    zIndex: 500
  })),
  
})
,oldEdgeStyle =  new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 1,
    color: colors.black
  }),
  zIndex: 100
})
,newEdgeStyle =  new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 1,
    color: colors.red
  }),
  zIndex: 100
})
,intEdgeStyle =  new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 1,
    color: colors.green
  }),
  zIndex: 110
})
,borEdgeStyle =  new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 1,
    color: colors.blue
  }),
  zIndex: 100
})
,pathEdgeStyle =  new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 4,
    color: colors.pink
  }),
  zIndex: 200
})
,nodeSource = new ol.source.Vector({
  features: [] 
})
,nodeLayer = new ol.layer.Vector({
  source: nodeSource,
  style: nodeStyle
}),
labelSource = new ol.source.Vector({
  features: [] 
})
,labelLayer = new ol.layer.Vector({
  source: labelSource,
  style: labelStyle
})
,cnodeSource = new ol.source.Vector({
  features: [] 
})
,cnodeLayer = new ol.layer.Vector({
  source: cnodeSource,
  style: cnodeStyle
})
,oldEdgeSource = new ol.source.Vector({
  features: [] 
})
,oldEdgeLayer = new ol.layer.Vector({
  source: oldEdgeSource,
  style: oldEdgeStyle
})
,newEdgeSource = new ol.source.Vector({
  features: [] 
})
,newEdgeLayer = new ol.layer.Vector({
  source: newEdgeSource,
  style: newEdgeStyle
})
,pathEdgeSource = new ol.source.Vector({
  features: [] 
})
,pathEdgeLayer = new ol.layer.Vector({
  source: pathEdgeSource,
  style: pathEdgeStyle
})
,intEdgeSource = new ol.source.Vector({
  features: [] 
})
,intEdgeLayer = new ol.layer.Vector({
  source: intEdgeSource,
  style: intEdgeStyle
})
,borEdgeSource = new ol.source.Vector({
  features: [] 
})
,borEdgeLayer = new ol.layer.Vector({
  source: borEdgeSource,
  style: borEdgeStyle
})
,map = new ol.Map({
  target: 'map',
  layers: [
  new ol.layer.Tile({
    source: new ol.source.OSM()
  })
  ,oldEdgeLayer
  ,newEdgeLayer
  ,intEdgeLayer
  ,borEdgeLayer
  ,pathEdgeLayer
  ,nodeLayer
  ,cnodeLayer
  ,labelLayer
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([77.22145, 28.63184]),
    zoom: 15
  })
});


$('.selector').click(function(e){
  document.body.setAttribute("selectionMode", this.getAttribute("data"));
  $('.mode span').text(this.getAttribute("data"))
})

$('#query').click(function(e){
  if(query.origin.key == undefined || query.dest.key == undefined){
    showMsg("Please select origin and destination")
    return;
  }else{
    queryGraph(query).then(displayResult);
  }
})

$('#contract').click(function(){
 document.body.setAttribute("selectionMode","contract");
 $('.mode span').text("contract")
})

$('#intEdges').click(function(){
 document.body.setAttribute("selectionMode","intEdges");
 $('.mode span').text("interesting Edges")
})

$('#level').click(function(){
 document.body.setAttribute("selectionMode","level");
 $('.mode span').text("level")
})

$('#dispGraph').click(function(){
  getGraph().then(showGraph);
})

$('#dispCGraph').click(function(){
  getCGraph().then(showGraph);
})

$('#dispNodes').click(function(){
  getNodes().then(showNodes);
})

$('#clear').click(function(){
  var sources = [oldEdgeSource
  ,newEdgeSource
  ,nodeSource
  ,cnodeSource
  ,labelSource
  ,intEdgeSource
  ,borEdgeSource
  ,pathEdgeSource]

  sources.forEach(e=>{
    e.clear();
  })
})

$('#getId').click(function(){
  document.body.setAttribute("selectionMode","getId");
 $('.mode span').text("get id")
})

map.on('singleclick', function(evt) {
  var features = map.getFeaturesAtPixel(evt.pixel);
  
  var mode = document.body.getAttribute("selectionMode");
  console.log("mode =>", mode)
  // console.log(features)
  if(!features  || features.length == 0){
    showMsg("Please click on a feature");
    return;
  }
  if(features && features[0].N.key){
    if( mode =="origin" || mode=="dest" ){ 
      query[mode].key = features[0].N.key;
      // console.log(features[0])
      var coords = features[0].getGeometry().getCoordinates();
      coords = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
      query[mode].coords = [coords[1], coords[0]]; 
      setLabel(coords, query[mode].key);

    }else if( mode == "contract"){
      // showMsg("Node " + features[0].N.key.toString())
      var coord = features[0].getGeometry().getCoordinates();
      coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
      contract(features[0].N.key, coord)
      
    }else if(mode == "intEdges"){
      getIntEdges(features[0].N.key).then(showIntEdges);
    }else if(mode == "level"){
      getLevel(features[0].N.key).then(showLevel);
    }else if(mode == "getId"){
      console.log(features[0].N.key)
    }
  }
});

function setLabel(coords, key){
  var p = makePointFeature(coords,key);
  labelSource.addFeature(p);

}


function makeLineFeature(coordinates){
  var lineString = new ol.geom.LineString(coordinates);
  lineString.transform('EPSG:4326', 'EPSG:3857');
  return new ol.Feature({
    geometry: lineString,
    name: 'Line'
  })
}

function makePointFeature(lonlat, key){
  return new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.transform(lonlat, 'EPSG:4326',     
      'EPSG:3857')),
    key,
    name: 'Point'
  });
}

function createEdge(edgeId){
  return getEdge(edgeId).then((edge)=>{
    // console.log("edge =>", edge)
    var promises = edge.nodes.map(e=>{
      return getNode(e)
    })
    return Promise.all(promises)
  }).then(results=>{
    var coordinates = results.map((el)=>{
      return [el.latLng.lng, el.latLng.lat]
    })
    return makeLineFeature(coordinates);
  })
}

function contract(nodeKey, coord){
  console.log("contract =>", nodeKey)
  sendXMLRequest('POST', '/testCH/contract', JSON.stringify({node:nodeKey})).then((data)=>{
    console.log("shortcuts =>", data)
    var p = makePointFeature(coord, nodeKey);
    // console.log(p)
    cnodeSource.clear();
    cnodeSource.addFeature(p);
    showMsg(data.newEdges.length.toString() + " shorcuts added");
    var featurePromises = data.newEdges.map(e=> {return createEdge(e)})
    Promise.all(featurePromises).then(features =>{
      // console.log("features =>",features)
      newEdgeSource.clear();
      newEdgeSource.addFeatures(features)
      
    })
  })  
}

function getNodes(){
  return sendXMLRequest('GET','/testCH/nodes', '')
}

function getEdge(edgeId){
  return sendXMLRequest('POST', '/testCH/edge', JSON.stringify({edgeId}))
}

function getIntEdges(nodeId){
  return sendXMLRequest('POST', '/testCH/intEdges', JSON.stringify({nodeId}))
}

function getNode(nodeId){
 return sendXMLRequest('POST', '/testCH/node', JSON.stringify({nodeId})) 
}

function getGraph(){
 return sendXMLRequest('GET', '/testCH/graph', ''); 
}

function getCGraph(){
 return sendXMLRequest('GET', '/testCH/Cgraph', ''); 
}

function getLevel(nodeId){
 return sendXMLRequest('POST', '/testCH/level',  JSON.stringify({nodeId})); 
}

function getOriginalPath(path){
  console.log("send path =>",path)
  return sendXMLRequest('POST', '/testCH/origPath',  JSON.stringify({path})); 
}

function showGraph(data){
  var newE = [];
  var oldE = [];
  for(var i in data){
    var coordinates = data[i].coordinates.map(({lat, lng}={})=>{
      return [lng, lat];
    })
    var k = makeLineFeature(coordinates);
    // console.log(data[i].new)
    if(data[i].new){
      newE.push(k);
    }else{
      oldE.push(k);
    }
  }
  oldEdgeSource.clear()
  newEdgeSource.clear()
  oldEdgeSource.addFeatures(oldE);
  newEdgeSource.addFeatures(newE);
}

function sendXMLRequest(method, url, data){
  return new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
    xhr.addEventListener('load', (p)=>{
      if(p.currentTarget.readyState == 4 && p.currentTarget.status == 200){
        resolve(JSON.parse(p.currentTarget.responseText));
      }
    })
    xhr.addEventListener('progress', p=>{})
    xhr.addEventListener('error', p=>{
      console.log('error', p);
      reject(p);
    })
  });
}

function showMsg(text){
  $("#msg").fadeIn();
  $("#msg").text(text);
  setTimeout(function(){
    $("#msg").fadeOut();
  }, 1000);
}


function showNodes(data){
  nodeSource.clear();
  var iconFeatures=[];
  for(var key in data){
    var value = data[key];
    var lonlat = [value.latLng.lng,value.latLng.lat];
    var iconFeature = makePointFeature(lonlat, key);
    iconFeatures.push(iconFeature);
  }
  nodeSource.addFeatures(iconFeatures);
  
}

function showIntEdges({intEdges}){

  intEdgeSource.clear();
  var promises = [];
  for(var i of intEdges){
    promises.push(createEdge(i));
  }
  Promise.all(promises).then(features=>{
    intEdgeSource.addFeatures(features);
  })
}

function queryGraph(query){
  // console.log(query)
  return sendXMLRequest('POST', '/testCH/query', JSON.stringify(query));
}


function displayResult(data){
  console.log(data)
  // intEdgeSource.clear();
  // borEdgeSource.clear();
  // var boring = data.boringEdges;
  // var interesting = data.interestingEdges;
  // var bpromises = [];
  // var ipromises = [];
  // for(var k of boring){
  //   bpromises.push(createEdge(k));
  // }
  // for(var k of interesting){
  //   ipromises.push(createEdge(k))
  // }
  // Promise.all(bpromises).then(bfeatures=>{
  //   borEdgeSource.addFeatures(bfeatures)
  // })
  // Promise.all(ipromises).then(ifeatures=>{
  //   intEdgeSource.addFeatures(ifeatures)
  // })
  if(Object.keys(data.path).length != 0)
    getOriginalPath(data.path).then(showPath);
}

function showPath({path}){
  pathEdgeSource.clear();
  // var promises = [];
  // for(var i of path){
  //   promises.push(createEdge(i));
  // }
  // Promise.all(promises).then(features=>{
  //   pathEdgeSource.addFeatures(features);
  // })
  var lineFeatures = path.map(p=>{
    return makeLineFeature([getLonLat(p[0]), getLonLat(p[1])])
  })
  pathEdgeSource.addFeatures(lineFeatures)
}

$('#dispNodes')[0].click();

function showLevel({level}={}){
  $('.level span').text(level);
}

function getLonLat({lat, lng}){
  return [lng, lat]
}

