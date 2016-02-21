var ip = "192.168.1.45";
var ipLogin = "http://"+ip+":8080/Login";
var socket = new WebSocket("ws://"+ip+":8080/CapitanFilips/acciones");
socket.onmessage = onMessage;
