(function(obj){

/*** fetch request ***/

fetch('/fetchRequest').then((res)=>{
	return res.json()
	// return res.blob();
}).then(json=>{
	console.log('@fetch',json);
})


/*** xhr request ***/
var message = "MySecretMessage";
var xhr = new XMLHttpRequest();
xhr.open('POST', './xhrRequest');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({message}));

// JSON.stringify({"message": message})
xhr.addEventListener('load', (p)=>{
	console.log('@xhr loaded', JSON.parse(p.currentTarget.responseText));
	
})

xhr.addEventListener('progress', p=>{
	// console.log('progress', p);
})
xhr.addEventListener('error', p=>{
	console.log('error', p);
})

/***  web socket ***/
var socket = new WebSocket('ws://127.0.0.1:3000/', 'echo-protocol');
socket.onopen = function(event){
	// console.log('socket opened')
	var messages = ['WebSocket', "rocks", "many", "many", "messages", "with", "just", "one", "connection"];
	for(i in messages){
		socket.send(messages[i]);
	}
}

socket.onmessage = function(event){
	console.log('@socket',event.data)
}

})(window);