var ships = (function() {
  function Ship (game, type, x, y) {
    this.game = game;

    this.dx = x;
    this.dy = y;
    this.dRotation = 0;

    this.el = this.game.add.sprite(x, y, type);
    this.el.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this.el, Phaser.Physics.ARCADE);
    this.el.body.collideWorldBounds = true;
    this.el.health = 2;

    this.state = ShipStates.Alive;

    this.el.type = type;

    this.bulletRange = 200;

    this.timer = this.game.time.create(false);
    this.timer.loop(100, function() { this.allowSend = true; }, this);

    this.allowSend = false;

    this.timer.start();

    return this.el;
  }

  Ship.prototype = {
    constructor: Ship,
    hasMoved: function() {
      var xDiff = Math.ceil(this.dx) != Math.ceil(this.el.x);
      var yDiff = Math.ceil(this.dx) != Math.ceil(this.el.x);
      var rotationDiff = Math.ceil(this.dRotation) != Math.ceil(this.el.rotation);

      if (xDiff || yDiff || rotationDiff) {
        return true;
      } else {
        return false;
      }
    },
    update: function(cursors) {
      if (this.el.alive) {
        if (cursors) {
          if (cursors.left.isDown)
          {
            this.el.body.rotation -= 4;
          }
          else if (cursors.right.isDown)
          {
            this.el.body.rotation += 4;
          }
          else if (cursors.up.isDown)
          {
            if (this.el.type == ShipsType.Submarine) {
              this.el.currentSpeed = 300;
            } else {
              this.el.currentSpeed = 150;
            }
            
          }
        }

        if(this.el.currentSpeed == 0) {
          this.el.body.velocity.x = 0;
          this.el.body.velocity.y = 0;
        }

        if (this.el.currentSpeed >= 0)
        {        
          this.dx = Math.ceil(this.el.x);
          this.dy = Math.ceil(this.el.y);
          this.dRotation = Math.ceil(this.el.rotation);

          if (this.el.currentSpeed > 0) {
            this.el.currentSpeed -= 5;
            this.game.physics.arcade.velocityFromRotation(this.el.rotation, this.el.currentSpeed, this.el.body.velocity);
          }
        }

        if (this.hasMoved && this.allowSend)  {
          var message = {
            id: WebSocketIDs.UpdateCoordinates,
            x: this.el.x,
            y: this.el.y,
            rotation: this.el.rotation
          };
          webSocket.sendMessage(message);
          this.allowSend = false;
        }
      }
    }
  }

  Ship.prototype.damage = function(ammoType) {
    if (ammoType == 'bullet') {
      this.el.health -= 1;
    } else {
      this.el.health -= 2;
    }
    if (this.el.health <= 0) {
      this.el.kill();
      this.state = ShipStates.Destroyed;
      return true;
    }
    return false;
  }

  /* ------------------------ */
  /* ------- CARGUERO ------- */
  /* ------------------------ */

  function CargoBoat(game, type, x, y) {
    Ship.call(this, game, type, x, y);

    this.light = false;
    this.lightChange = false;
    this.lightRate = 500;
    this.lightTimer = 0;

    this.nextFire = 0;

    this.vision = game.add.graphics(-1000, -1000);
    this.vision.beginFill(0x000000);
    this.vision.drawCircle(0, 0, 400);

    // Propiedades del barco azul
    if (this.el.type == ShipsType.Blue) {

      // Creo la bala izquierda
      this.bulletLeft = this.game.add.sprite(0, 0, 'bullet');
      this.bulletLeft.anchor.setTo(0.5, 0.5);
      this.bulletLeft.exists = false;
      this.game.physics.arcade.enable(this.bulletLeft);
      this.bulletLeft.body.checkWorldBounds = true;
      this.bulletLeft.startX;
      this.bulletLeft.startY;
      this.bulletLeft.outOfBoundsKill = true;

      // Creo la bala derecha
      this.bulletRight = this.game.add.sprite(0, 0, 'bullet');
      this.bulletRight.anchor.setTo(0.5, 0.5);
      this.bulletRight.exists = false;
      this.game.physics.arcade.enable(this.bulletRight);
      this.bulletRight.body.checkWorldBounds = true;
      this.bulletRight.startX;
      this.bulletRight.startY;
      this.bulletRight.outOfBoundsKill = true;

      // Fijo SPACEBAR como boton para disparar
      this.bulletButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }
    // Fijo F como boton para prender/apagar la luz
    this.lightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

  }

  CargoBoat.prototype = Object.create(Ship.prototype);
  CargoBoat.prototype.constructor = CargoBoat;
  CargoBoat.prototype.update = function(cursors) {
    Ship.prototype.update.call(this, cursors);

    if (this.lightButton.isDown) {
      if (this.game.time.now > this.lightTimer) {
        this.lightTimer = game.time.now + this.lightRate;
        this.turnLightOnOff();
        this.updateLightOnOff();
      }
    }

    // Si no hay una bala disparada -> dispara
    if (this.el.type == ShipsType.Blue) {
      if (this.bulletButton.isDown) {
        if ((!(this.bulletLeft.exists) && !(this.bulletRight.exists))
              || (!(this.bulletLeft.alive) && !(this.bulletRight.alive))) {
          this.fireBullet();
          this.updateBulletShot();
        }
      }
    }

  }

  CargoBoat.prototype.turnLightOnOff = function() {
    this.light = !(this.light);

    this.vision.clear();
    this.vision = game.add.graphics(this.el.x, this.y);
    this.vision.beginFill(0x000000);
    if (this.light) {
      this.vision.drawCircle(0, 0, 600);
    } else {
      this.vision.drawCircle(0, 0, 400);
    }
  }


  CargoBoat.prototype.updateLightOnOff = function() {
    var message = {
      id: WebSocketIDs.LightOnOff,
      value: this.light
    };
    webSocket.sendMessage(message);
  }

  CargoBoat.prototype.updateBulletShot = function() {
    var message = {
      id: WebSocketIDs.BulletShotDouble
    };
    webSocket.sendMessage(message);
  }

  CargoBoat.prototype.fireBullet = function() {
    if (this.el.alive) {

      this.bulletLeft.reset(this.el.x, this.el.y);
      this.bulletRight.reset(this.el.x, this.el.y);

      this.bulletLeft.rotation = this.el.rotation;
      this.bulletRight.rotation = this.el.rotation;

      var gunLeft = Math.PI * 1.5;  // Izquierda
      var gunRight = Math.PI * 0.5;  // Derecha

      //  Disparo las balas considerando la direccion del barco
      this.game.physics.arcade.velocityFromRotation(this.el.rotation + gunLeft, 500, this.bulletLeft.body.velocity);
      this.game.physics.arcade.velocityFromRotation(this.el.rotation + gunRight, 500, this.bulletRight.body.velocity);
      
      this.bulletLeft.startX = this.el.x;
      this.bulletLeft.startY = this.el.y;

      this.bulletRight.startX = this.el.x;
      this.bulletRight.startY = this.el.y;

    }
  }

    /* ------------------------- */
    /* ------- SUBMARINO ------- */
    /* ------------------------- */

    function Submarine (game, type, x, y) {
      Ship.call(this, game, type, x, y);

      this.nextFire = 0;

      this.missileRange = this.bulletRange * 2;
      this.fireRateMissile = 4000;
      this.nextFireMissile = 0;

      this.vision = game.add.graphics(-1000, -1000);
      this.vision.beginFill(0x000000);
      this.vision.drawCircle(0, 0, 1200);

      // Creo la bala
      this.bullet = this.game.add.sprite(0, 0, 'bullet');
      this.bullet.anchor.setTo(0.5, 0.5);
      this.bullet.exists = false;
      this.game.physics.arcade.enable(this.bullet);
      this.bullet.body.checkWorldBounds = true;
      this.bullet.startX;
      this.bullet.startY;
      this.bullet.outOfBoundsKill = true;

      // Creo el misil
      this.missile = this.game.add.sprite(0, 0, 'missile');
      this.missile.anchor.setTo(0.5, 0.5);
      this.missile.exists = false;
      this.game.physics.arcade.enable(this.missile);
      this.missile.body.checkWorldBounds = true;
      this.missile.startX;
      this.missile.startY;
      this.missile.outOfBoundsKill = true;

      this.bulletButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.missileButton = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);

  }

  Submarine.prototype = Object.create(Ship.prototype);
  Submarine.prototype.constructor = Submarine;
  Submarine.prototype.update = function(cursors) {
    Ship.prototype.update.call(this, cursors);

    if (this.bulletButton.isDown) {
      if ((!(this.bullet.exists) && !(this.bullet.exists))
            || (!(this.bullet.alive) && !(this.bullet.alive))) {
        this.fireBullet();
        this.updateBulletShot();
      }
    }

    if (this.missileButton.isDown) {
      if (this.game.time.now > this.nextFireMissile) {
        this.nextFireMissile = game.time.now + this.fireRateMissile;
        this.fireMissile();
        this.updateMissileShot();
      }
    }
  }

  Submarine.prototype.updateBulletShot = function() {
    var message = {
      id: WebSocketIDs.BulletShot
    };
    webSocket.sendMessage(message);
  }

  Submarine.prototype.updateMissileShot = function() {
    var message = {
      id: WebSocketIDs.MissileShot
    };
    webSocket.sendMessage(message);
  }

  Submarine.prototype.fireBullet = function() {
    if (this.el.alive) {
      // Verifico que el submarino siga vivo

      this.bullet.reset(this.el.x, this.el.y);
      this.bullet.rotation = this.el.rotation;
      this.bullet.startX = this.el.x;
      this.bullet.startY = this.el.y;

      //  Disparo la bala considerando la direccion del barco
      this.game.physics.arcade.velocityFromRotation(this.el.rotation, 500, this.bullet.body.velocity);
    }
  }

  Submarine.prototype.fireMissile = function() {

    if (this.el.alive) {
      // Verifico que el submarino siga vivo

      this.missile.reset(this.el.x, this.el.y);
      this.missile.rotation = this.el.rotation;
      this.missile.startX = this.el.x;
      this.missile.startY = this.el.y;

      //  Disparo el misil en la direccion del barco
      this.game.physics.arcade.velocityFromRotation(this.el.rotation, 500, this.missile.body.velocity);
    }
  }

  // Variables de los barcos
  var submarine, blue, green, game;

  var init = function(_game, _admin) {
    game = _game;

    var caribbean = map.getCaribbean();
    var x, y;

    var overlapsIsland = true;
    var islands = caribbean.islands;

    // Crea el submarino chequeando que no este sobre una isla
    while (overlapsIsland) {
      x = game.rnd.between(map.worldBounds.xTopLeft, map.worldBounds.xBottomRight);
      y = game.rnd.between(caribbean.yTop + 72, caribbean.yBottom - 72);

      submarine = new Submarine(game, ShipsType.Submarine, x, y);
      var end = true;
      game.physics.arcade.overlap(islands, submarine.el, function() {
        console.log (submarine.el.overlap(islands));
        submarine = null;
        end = false;
      });
      if (end) {
        overlapsIsland = false;
        game.physics.arcade.overlap(islands, submarine.el);
      }
      
    }

    blue = new CargoBoat(game, ShipsType.Blue, 500, 4700);
    blue.el.visible = false;

    green = new CargoBoat(game, ShipsType.Green, 900, 4700);
    green.el.visible = false;

    setTimeout(function() {
      var mvd = map.getMvd();
      blue.el.x = mvd.port.x - 100;
      blue.el.y = mvd.port.y - 200;
      blue.el.visible = true;

      green.el.x = mvd.port.x - 300;
      green.el.y = mvd.port.y - 200;
      green.el.visible = true;
    }, 5000);

    if (_admin) {
      saveShips(false);
    }
  };

  var saveShips = function(fromSaveBtn) {
    var ships = [
      { 
        name: ShipsType.Submarine, 
        x: Math.floor(submarine.el.x),  
        y: Math.floor(submarine.el.y),
        rotation: Math.floor(submarine.el.rotation),
        health: submarine.el.health
      },
      {
        name: ShipsType.Blue, 
        x: Math.floor(blue.el.x),  
        y: Math.floor(blue.el.y),
        rotation: Math.floor(blue.el.rotation),
        health: blue.el.health
      },
      {
        name: ShipsType.Green, 
        x: Math.floor(green.el.x),  
        y: Math.floor(green.el.y),
        rotation: Math.floor(green.el.rotation),
        health: green.el.health
      }
    ];

    $.post("rest/ships/" + (fromSaveBtn ? 2 : 1), JSON.stringify(ships), function(response) {
      if (fromSaveBtn) {
        if (response == "success") {
          alert("Guardado con exito.")
        } else {
          alert("Ocurrio un error.")
        }
      }
    });
  };

  var getSubmarine = function() {
    return submarine;
  };

  var getBlue = function() {
    return blue;
  };

  var getGreen = function() {
    return green;
  };

  return {
    init: init,
    getSubmarine: getSubmarine,
    getBlue: getBlue,
    getGreen: getGreen,
    saveShips: saveShips
  }
})();