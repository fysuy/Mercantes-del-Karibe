var ShipsType = {
  Submarine: 'submarine',
  Blue: 'blue',
  Green: 'green'
};

var WebSocketIDs = {
  UpdateCoordinates: 'updateCoordinates',
  BulletShot: 'bulletShot',
  BulletShotDouble: 'bulletShotDouble',
  MissileShot: 'missileShot',
  LightOnOff: 'lightOnOff',
  ShipArrived: 'shipArrived',
  ShipsCollided: 'shipsCollided'
};

var Strings = {
  PlayerArrived: 'Has llegado a Nueva York.',
  ShipArrivedBlue: 'El carguero azul ha llegado a Nueva York.',
  ShipArrivedGreen: 'El carguero verde ha llegado a Nueva York.',
  PlayerCollided: 'Has impactado con otra embarcación.',
  CollisionSubmarineBlue: 'El submarino y el carguero azul han impactado.',
  CollisionSubmarineGreen: 'El submarino y el carguero verde han impactado.',
  CollisionBlueGreen: 'El carguero azul y el carguero verde han impactado.'
}

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
    game.load.image('water', 'assets/pattern-water.png');
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
    green = ships.getGreen();

    var shipType = getParameterByName("shipType");


    switch (shipType) {
      // Player submarino
      case ShipsType.Submarine:
        setPlayerShip(submarine);
        webSocket.setUser(ShipsType.Submarine);
        break;
      
      // Player carguero azul
      case ShipsType.Blue:
        setPlayerShip(blue);
        webSocket.setUser(ShipsType.Blue);
        break;
      
      // Player carguero verde
      case ShipsType.Green:
        setPlayerShip(green);
        webSocket.setUser(ShipsType.Green);
        break;
    }

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

          // Update de la posicion de los barcos
          case WebSocketIDs.UpdateCoordinates:
            if (jsonMsg.user != ship.el.type) {
              if (jsonMsg.user == ShipsType.Submarine) {
                submarine.el.x = jsonMsg.x;
                submarine.el.y = jsonMsg.y;
                submarine.el.rotation = jsonMsg.rotation;
              }

              if (jsonMsg.user == ShipsType.Blue) {
                blue.el.x = jsonMsg.x;
                blue.el.y = jsonMsg.y;
                blue.el.rotation = jsonMsg.rotation;
              }

              if (jsonMsg.user == ShipsType.Green) {
                green.el.x = jsonMsg.x;
                green.el.y = jsonMsg.y;
                green.el.rotation = jsonMsg.rotation;
              }
            }
            break;

          // Update de la luz
          case WebSocketIDs.LightOnOff:
            if (jsonMsg.user == ShipsType.Blue) {
              blue.light = jsonMsg.value;
            }

            if (jsonMsg.user == ShipsType.Green) {
              green.light = jsonMsg.value;
            }
            break;

          // Update del disparo azul
          case WebSocketIDs.BulletShotDouble:
            if (jsonMsg.user == ShipsType.Blue) {
              blue.fireBullet();
            }
            break;

          // Update del disparo bala submarino
          case WebSocketIDs.BulletShot:
            if (jsonMsg.user == ShipsType.Submarine) {
              submarine.fireBullet();
            }
            break;

          // Update del misil submarino
          case WebSocketIDs.MissileShot:
            if (jsonMsg.user == ShipsType.Submarine) {
              submarine.fireMissile();
            }
            break;

          // Update carguero llega al puerto
          case WebSocketIDs.ShipArrived:
            if (jsonMsg.user == ShipsType.Blue) {
              blue.el.kill();
            } else {
              green.el.kill();
            }
            
            if (jsonMsg.user != ship.el.type) {
              if (jsonMsg.user == ShipsType.Blue) {
                // Azul llego a NY
                game.debug.reset();
                game.debug.text(Strings.ShipArrivedBlue, 32, 32, '#ffffff', '16px Arial');
              } else {
                // Verde llego a NY
                game.debug.reset();
                game.debug.text(Strings.ShipArrivedGreen, 32, 32, '#ffffff', '16px Arial');
              }
            } 
            break;

          // Update colision entre barcos
          case WebSocketIDs.ShipsCollided:
            var shipOne = jsonMsg.shipOne;
            var shipTwo = jsonMsg.shipTwo;

            if ((shipOne == ShipsType.Submarine || shipTwo == ShipsType.Submarine)
                  && (shipOne == ShipsType.Blue || shipTwo == ShipsType.Blue)) {
              console.log('Submarino vs azul');
              // Submarino vs azul
              submarine.el.kill();
              blue.el.kill();
              game.debug.reset();
              if (ship.el.type == shipOne || ship.el.type == shipTwo) {
                game.debug.text(Strings.PlayerCollided, 32, 32, '#ffffff', '16px Arial');
              } else {
                game.debug.text(Strings.CollisionSubmarineBlue, 32, 32, '#ffffff', '16px Arial');
              }

            } else if ((shipOne == ShipsType.Submarine || shipTwo == ShipsType.Submarine)
                        && (shipOne == ShipsType.Green || shipTwo == ShipsType.Green)) {
              console.log('Submarino vs verde');
              // Submarino vs verde
              submarine.el.kill();
              green.el.kill();
              game.debug.reset();
              if (ship.el.type == shipOne || ship.el.type == shipTwo) {
                game.debug.text(Strings.PlayerCollided, 32, 32, '#ffffff', '16px Arial');
              } else {
                game.debug.text(Strings.CollisionSubmarineGreen, 32, 32, '#ffffff', '16px Arial');
              }
            } else {
              console.log('Azul vs verde');
              // Azul vs verde
              blue.el.kill();
              green.el.kill();
              game.debug.reset();
              if (ship.el.type == shipOne || ship.el.type == shipTwo) {
                game.debug.text(Strings.PlayerCollided, 32, 32, '#ffffff', '16px Arial');
              } else {
                game.debug.text(Strings.CollisionBlueGreen, 32, 32, '#ffffff', '16px Arial');
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
      // Actualizo el barco azul
      if (blue.light == false 
        && game.physics.arcade.distanceBetween(submarine.el, blue.el) > 200) {
        blue.el.alpha = 0;
      } else {
        blue.el.alpha = 1;
      }

      // Actualizo el barco verde
      if (green.light == false 
        && game.physics.arcade.distanceBetween(submarine.el, green.el) > 200) {
        green.el.alpha = 0;
      } else {
        green.el.alpha = 1;
      } 

      // Submarino vs azul
      game.physics.arcade.overlap(blue.el, submarine.el, function() {
        blue.el.kill();
        submarine.el.kill();
        var message = {
          id: WebSocketIDs.ShipsCollided,
          shipOne: ShipsType.Submarine,
          shipTwo: ShipsType.Blue,
        }
        webSocket.sendMessage(message);
        game.debug.reset();
        game.debug.text(Strings.PlayerCollided, 32, 32, '#ffffff', '16px Arial');
      });

      // Submarino vs verde
      game.physics.arcade.overlap(green.el, submarine.el, function() {
        green.el.kill();
        submarine.el.kill();
        var message = {
          id: WebSocketIDs.ShipsCollided,
          shipOne: ShipsType.Submarine,
          shipTwo: ShipsType.Green,
        }
        webSocket.sendMessage(message);
        game.debug.reset();
        game.debug.text(Strings.PlayerCollided, 32, 32, '#ffffff', '16px Arial');
      });

    }    

    // Los barcos chocan contra la tierra pero no se hunden
    game.physics.arcade.collide([ny.land, mvd.land, caribbean.islands], ship.el);
    
    // Carguero llega a NY
    if (ship.el.type == ShipsType.Blue || ship.el.type == ShipsType.Green) {
      game.physics.arcade.overlap(ny.port, ship.el, function() {
        // Destruye al carguero
        ship.el.kill();
        // Notifica al WS
        var message = {
          id: WebSocketIDs.ShipArrived
        };
        webSocket.sendMessage(message);
        game.debug.reset();
        game.debug.text(Strings.PlayerArrived, 32, 32, '#ffffff', '16px Arial');
      })
    }

    if (ship.el.type == ShipsType.Blue) {
      // Azul vs verde
      game.physics.arcade.overlap(green.el, blue.el, function() {
        green.el.kill();
        blue.el.kill();
        var message = {
          id: WebSocketIDs.ShipsCollided,
          shipOne: ShipsType.Blue,
          shipTwo: ShipsType.Green,
        }
        webSocket.sendMessage(message);
        game.debug.reset();
        game.debug.text(Strings.PlayerCollided, 32, 32, '#ffffff', '16px Arial');
      });
    }
    

    
    
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
      blue.damage('bullet');
    });

    // Azul vs misil
    game.physics.arcade.overlap(submarine.missile, blue.el, function() {
      submarine.missile.kill();
      var destroyed = blue.damage('missile');
      if (destroyed) {
        alert("AZUL HUNDIDO");
      }
    });

    ship.update(cursors);

  }

  var setPlayerShip = function(_ship) {
    ship = _ship;
  };
})();