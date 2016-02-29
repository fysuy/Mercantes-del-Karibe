var webSocket = (function() {  
  var ip = "192.168.1.44";
  var connection;
  var user;

  var sendMessage = function (x, y, rotation) {   
    var msg = {
      user: user,
      x: x,
      y: y,
      rotation: rotation
    };

    connection.send(JSON.stringify(msg));
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