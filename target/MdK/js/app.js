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
    //map.generateMask(ship.el);
    mask = blue.vision;
    game.world.mask = mask;

    // Seteo que la camara siga al submarino
    game.camera.follow(ship.el);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

    game.input.activePointer.x = ship.x;
    game.input.activePointer.y = ship.y;
    
    webSocket.setOnMessage(function (message) {
      try {
        var jsonMsg = JSON.parse(message.data);

        switch(jsonMsg.id) {
          case 'updateCoordinates':
            if (jsonMsg.data.user != ship.el.type) {
              if (jsonMsg.data.user == ShipsType.Submarine) {
                submarine.el.x = jsonMsg.data.x;
                submarine.el.y = jsonMsg.data.y;
                submarine.el.rotation = jsonMsg.data.rotation;
              }

              if (jsonMsg.data.user == ShipsType.Blue) {
                blue.el.x = jsonMsg.data.x;
                blue.el.y = jsonMsg.data.y;
                blue.el.rotation = jsonMsg.data.rotation;
              }
            }
            break;
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
    // mask = map.getMask(ship);
    
    mask = ship.vision;
    game.world.mask = mask;

    mask.x = ship.el.body.x + 36;
    mask.y = ship.el.body.y + 36;

    /* 
    Si el barco tiene la luz apagada, el submarino
    lo ve solo dentro de un radio de 200.
    Si el barco tiene la luz prendida, el submarino lo ve siempre
    */ 
    if (ship.el.type == ShipsType.Submarine) {
      if (blue.light == false 
        && game.physics.arcade.distanceBetween(submarine.el, blue.el) > 200) {
          blue.el.alpha = 0.2;
      } else {
        blue.el.alpha = 1;
      }
    }    

    game.physics.arcade.collide([ny.land, mvd.land, caribbean.islands], ship.el, 
      function() {
      //ship.el.kill();
      alert("¡NAUFRAGIO!");
    });
    

    // Azul llego
    game.physics.arcade.overlap(ny.port, blue.el, function() {
      alert("LLEGO EL AZUL");
      //blue.el.kill();
      
      // Una vez que muere puede seguir al otro
      //game.camera.follow(ships.blue);
      //mask.destroy();
    })



    // Submarino vs azul
    game.physics.arcade.overlap(blue.el, submarine.el, function() {
      //blue.el.kill();
      //submarine.el.kill();
      alert("CHOCAN LOS BARCOS");
    });
    
    // Submarino vs bulletLeft
    game.physics.arcade.overlap(blue.bulletLeft, submarine.el, function() {
      blue.bulletLeft.kill();
      var destroyed = submarine.damage('bullet');
      if (destroyed) {
        alert("SUBMARINO HUNDIDO");
      }
    });

    // Submarino vs bulletLeft
    game.physics.arcade.overlap(blue.bulletRight, submarine.el, function() {
      blue.bulletRight.kill();
      var destroyed = submarine.damage('bullet');
      if (destroyed) {
        alert("SUBMARINO HUNDIDO");
      }
    });

    // Azul vs bullet
    game.physics.arcade.overlap(submarine.bullet, blue.el, function() {
      submarine.bullet.kill();
      var destroyed = blue.damage('bullet');
      if (destroyed) {
        alert("AZUL HUNDIDO");
      }
    });

    // Azul vs misil
    game.physics.arcade.overlap(submarine.missile, blue.el, function() {
      submarine.missile.kill();
      var destroyed = blue.damage('missile');
      if (destroyed) {
        alert("AZUL HUNDIDO");
      }
    });


    // Manda la posicion al server
    // if (submarine.alive && sendToServer) {
    //   webSocketJs.sendMessage('submarine', submarine.x, submarine.y, submarine.angle);
    // }
  
    // Recibe la posición del oponente y la actualiza
    //

    ship.update(cursors);
    //blue.update();

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