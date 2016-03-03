var webSocket = (function() {  
  var ip = "localhost";

  var connection;
  var user;

  var sendMessage = function (message) {
    message.user = user;
    connection.send(JSON.stringify(message));
  };

  var setUser = function (name, shipType) {
    // el user guarda el tipo de barco no el nickname
    user = shipType;

    var msg = {
      id: "setRole",
      name: name,
      role: shipType 
    };

    connection.send(JSON.stringify(msg));
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

    return connection;
  };

  return {
    sendMessage: sendMessage,
    setOnMessage : setOnMessage,
    setUser: setUser, 
    init: init
  }
})();