var ShipsType = {
  Submarine: 'submarine',
  Blue: 'blue',
  Green: 'green'
};

var wsCounter = 0;

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var app = (function  () {
  var cursors,
    gameWidth = 800, 
    gameHeight = 600, 
    gameContainer = 'game-container',
    submarine, blue, green, ship,
    caribbean, ny, mvd, mask,
    currentSpeed;

  var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, gameContainer, { 
    preload: preload, 
    create: create, 
    update: update, 
    render: render 
  });

  function render() {

  }

  function preload() 
  {
    game.load.image('empty', 'assets/empty.png');
    game.load.image('land', 'assets/pattern-land.png');
    game.load.image('port', 'assets/port.png');
    game.load.image('submarine', 'assets/submarine-red.png');
    game.load.image('blue', 'assets/ship-blue.png');
    game.load.image('green', 'assets/ship-green.png');
    game.load.image('island', 'assets/pattern-island.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('missile', 'assets/missile.png');
  }

  function create() {
    // Inicio el motor fisico
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Inicio todo lo relacionado al mapa del juego
    var admin = getParameterByName("admin");
    map.init(game, admin);
    
    // Inicio las naves
    ships.init(game);

    submarine = ships.getSubmarine();
    blue = ships.getBlue();

    var shipType = getParameterByName("shipType");

    if (shipType == ShipsType.Submarine) {
      setPlayerShip(submarine);
      webSocket.setUser(ShipsType.Submarine);
    } else if (shipType == ShipsType.Blue) {
      setPlayerShip(blue);
      webSocket.setUser(ShipsType.Blue);
    }

    // Seteo la mascara (alcanze de la luz) dependiendo del barco
    map.generateMask(ship.el);

    // Seteo que la camara siga al submarino
    game.camera.follow(ship.el);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

    game.input.activePointer.x = ship.x;
    game.input.activePointer.y = ship.y;
    
    webSocket.setOnMessage(function (message) {
      try {
        var jsonMsg = JSON.parse(message.data);

        if (jsonMsg.user == ShipsType.Submarine && jsonMsg.x) {
          submarine.el.x = jsonMsg.x;
          submarine.el.y = jsonMsg.y;
          submarine.el.rotation = jsonMsg.rotation;
        }

        if (jsonMsg.user == ShipsType.Blue && jsonMsg.x) {
          blue.el.x = jsonMsg.x;
          blue.el.y = jsonMsg.y;
          blue.el.rotation = jsonMsg.rotation;
        }
      } catch(err) {
        console.log(err);
      }   
    });
  }

  function update() {
    caribbean = map.getCaribbean();
    ny = map.getNY();
    mvd = map.getMvd();
    mask = map.getMask();

    mask.x = ship.el.body.x + 36;
    mask.y = ship.el.body.y + 36;

    game.physics.arcade.collide([ny.land, mvd.land], ship.el);
    game.physics.arcade.collide(ship.el, caribbean.islands);

    game.physics.arcade.overlap(ny.port, ship.el, function() {
      alert("LLego!");
      submarine.el.kill();
      
      // Una vez que muere puede seguir al otro
      //game.camera.follow(ships.blue);
      //mask.destroy();
    });
    
    game.physics.arcade.collide(blue.el, submarine.el, function() {
      //red.body.velocity = { x: 0, y: 0 };
      //submarine.body.velocity = { x: 0, y: 0 };

      alert("Boom!");
      blue.el.kill();
    });

    ship.update(cursors);

    // game.physics.arcade.collide(bullet, red, function() {
    //   ships.blue.kill();
    //   bullet.kill();
    //   alert('Rojo hundido');
    // });

    // game.physics.arcade.collide([red, newYork, montevideo, islands], bullet, function() {
    //   bullet.kill();
    // });
  }

  var setPlayerShip = function(_ship) {
    ship = _ship;
  };
})();