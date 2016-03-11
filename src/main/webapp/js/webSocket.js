var webSocket = (function() {  
  var ip = "192.168.1.101";

  var connection, userRole, gameId;

  var sendMessage = function (message) {
    message.user = userRole;
    connection.send(JSON.stringify(message));
  };

  var setUser = function (_user) {
    userRole = _user;
  };

  var setOnMessage = function (fn) {
    connection.onmessage = fn;
  };

  var init = function(_nickname) {
    var conStr = "ws://" + ip + ":8080/Mercantes-del-Karibe/wsServerEndpoint/" + gameId + "/" + _nickname;

    connection = new WebSocket(conStr);
    
    connection.onerror = function(evt) {
      console.log(evt);
    };

    connection.onclose = function(evt) {
      console.log(evt);
    };

    return connection;
  };

  var setGameId = function(id) { gameId = id; }

  return {
    sendMessage: sendMessage,
    setOnMessage : setOnMessage,
    setUser: setUser, 
    setGameId: setGameId,
    init: init
  }
})();