var webSocket = (function() {  
  var ip = "192.168.1.108";

  var connection;
  var user;

  var sendMessage = function (message) {
    message.user = user;
    connection.send(JSON.stringify(message));
  };

  var setUser = function (name) {
    user = name;
  };

  var setOnMessage = function (fn) {
    connection.onmessage = fn;
  };

  var init = function() {
    connection = new WebSocket("ws://" + ip + ":8080/Mercantes-del-Karibe/wsServerEndpoint");
    connection.onerror = function(evt) {
      console.log(evt);
    };
    connection.onclose = function(evt) {
      console.log(evt);
    };
  };

  init();

  return {
    sendMessage: sendMessage,
    setOnMessage : setOnMessage,
    setUser: setUser
  }
})();