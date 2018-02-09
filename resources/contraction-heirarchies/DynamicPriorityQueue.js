module.exports = DynamicPriorityQueue;
var MPQ = require("./MinHeapPriorityQueue");

// use when processing one node needs a few other needs to be changed ( esp neighbours )

function DynamicPriorityQueue
(
	dynamicProperties=[] // array of keys of properties which require the cost to be recalculated
	,debugCallback
)
{
	this.queue = new MPQ();
	// elements require id no, valueOf function && cost function ( to calculate cost )
	this.elements = {};
	this.dynamicProperties = dynamicProperties;
	this.debugCallback = debugCallback || console.log;
}

DynamicPriorityQueue.prototype.insert = function(element){
	element.cost();
	this.queue.insert(new Ele(element.id, element.valueOf()));
	this.elements[element.id] = element;
}

DynamicPriorityQueue.prototype.getProperty = function(id, key){
	return this.elements[id][key];
}

DynamicPriorityQueue.prototype.setProperty = function(id, key, value){
	if(!this.elements[id])return;
	this.elements[id][key] = value;
	if(this.dynamicProperties.indexOf(key) != -1)
		this.elements[id].cost();
	this.queue.changeValue(id, this.elements[id].valueOf())
	
}

DynamicPriorityQueue.prototype.front = function(){
	// console.log(this.queue)
	return this.queue.min().id;
}

DynamicPriorityQueue.prototype.pop = function(){
	var e = this.front();
	this.queue.extractMin();
	delete this.elements[e]
}

DynamicPriorityQueue.prototype.isEmpty = function(){
	// console.log("queue Length", this.queue.length, this.queue)
	return this.queue.isEmpty();
}


DynamicPriorityQueue.prototype.length = function(){
	return this.queue.length;
}

function Ele(id, value){
	this.id = id;
	this.value = value;
}