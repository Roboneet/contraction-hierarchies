var PQ = require("./MinHeapPriorityQueue.js");

run();

function run(){
	var p = new PQ();
	p.insert(new Ele(1, 4));
	p.insert(new Ele(2, 1));
	p.insert(new Ele(3, 3));
	p.insert(new Ele(4, 1));
	console.log(p)
	p.changeValue(3, 0)
	console.log(p)
	

}

function Ele(id, value){
	this.id = id;
	this.value = value;
}