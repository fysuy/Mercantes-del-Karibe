var webSocket = (function() {  
<<<<<<< HEAD
  var ip = "192.168.0.128";
=======
  var ip = "192.168.80.136";
>>>>>>> 4b4b274e8b05d122a2837f53ed9048e874e17c04
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
    connection = new WebSocket("ws://" + ip + ":8080/MdK/wsServerEndpoint");
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