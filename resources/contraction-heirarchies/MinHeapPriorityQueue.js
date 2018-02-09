module.exports = MinHeapPriorityQueue;

function MinHeapPriorityQueue(){
	this.queue = [];
	this.length = 0;
}

MinHeapPriorityQueue.prototype.insert = function(ele){
	this.length = this.length + 1;
	var pos = this.length;
	this.queue[pos - 1] = ele;
	while(pos > 1 && this.queue[Math.floor(pos/2) - 1].value > this.queue[pos -1].value){
		this.swap(pos -1, Math.floor(pos/2) - 1)
		pos  = Math.floor(pos/2);
	}
}

MinHeapPriorityQueue.prototype.heapify = function(index){
	var min = index;
	var left = (index + 1)*2 - 1;
	var right = (index + 1)*2;
	if(this.queue[left] && this.queue[left].value< this.queue[min].value){
		min = left;
	}
	if(this.queue[right] && this.queue[right].value< this.queue[min].value){
		min = right;
	}
	if(index != min){
		this.swap(min, index);
		this.heapify(min);
	}
}

MinHeapPriorityQueue.prototype.swap = function(i, j){
	this.queue[i] = [this.queue[j], this.queue[j] = this.queue[i]][0]; // swap
}

MinHeapPriorityQueue.prototype.min = function(){
	return this.queue[0];
}

MinHeapPriorityQueue.prototype.extractMin = function(){
	this.length = this.length - 1;
	var ele = this.queue[0];
	this.queue[0] = this.queue[this.length];
	this.queue[this.length] = undefined;
	this.heapify(0);
	return ele;
}

MinHeapPriorityQueue.prototype.changeValue = function(id, value){
	var p = 0;
	while(p < this.length && this.queue[p].id != id){
		p++;
	}
	if(p == this.length){
		console.log("id not found in pq")
		return
	}
	if(this.queue[p].value >= value){
		this.decreaseValue(p, value);
	}else{
		this.increaseValue(p, value)
	}
}

MinHeapPriorityQueue.prototype.increaseValue = function(index, value){
	this.queue[index].value = value;
	this.heapify(index);
}

MinHeapPriorityQueue.prototype.decreaseValue = function(index, value){
	this.queue[index].value = value;
	var pos = index + 1;
	// console.log(pos, this.queue)
	while(pos > 1 && this.queue[Math.floor(pos/2) - 1].value > this.queue[pos -1].value){
		this.swap(pos -1, Math.floor(pos/2) - 1)
		pos = Math.floor(pos/2);

	}
}

MinHeapPriorityQueue.prototype.isEmpty = function(){
	return this.length == 0;
}



