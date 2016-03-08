var webSocket = (function() {  
  var ip = "192.168.1.41";

  var connection;
  var user;

  var sendMessage = function (message) {
    message.user = user;
    connection.send(JSON.stringify(message));
  };

  var setUser = function (_user) {
    user = _user;
  };

  var setOnMessage = function (fn) {
    connection.onmessage = fn;
  };

  var init = function(_fromLoad, _nickname) {
    var conStr = "ws://" + ip + ":8080/Mercantes-del-Karibe/wsServerEndpoint/" + _nickname;
    if (_fromLoad) {
      connection = new WebSocket(conStr + "/" + "false");
    } else {
      connection = new WebSocket(conStr + "/" + "true");
    }
    
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