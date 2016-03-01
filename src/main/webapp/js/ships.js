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

    this.el.type = type;

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
            this.el.currentSpeed = 300;
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
      this.el.alive = false;
      this.el.kill();
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

    this.fireRateBullet = 500;
    this.nextFire = 0;

    this.vision = game.add.graphics(-1000, -1000);
    this.vision.beginFill(0x000000);
    this.vision.drawCircle(0, 0, 200);

    // Propiedades del barco azul
    if (this.el.type == ShipsType.Blue) {
      // Creo la bala izquierda
      this.bulletLeft = this.game.add.sprite(0, 0, 'bullet');
      this.bulletLeft.anchor.setTo(0.5, 0.5);
      this.bulletLeft.exists = false;
      this.game.physics.arcade.enable(this.bulletLeft);
      this.bulletLeft.body.checkWorldBounds = true;
      this.bulletLeft.outOfBoundsKill = true;
      this.bulletLeft.damage(1);

      // Creo la bala derecha
      this.bulletRight = this.game.add.sprite(0, 0, 'bullet');
      this.bulletRight.anchor.setTo(0.5, 0.5);
      this.bulletRight.exists = false;
      this.game.physics.arcade.enable(this.bulletRight);
      this.bulletRight.body.checkWorldBounds = true;
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

    if (this.el.type == ShipsType.Blue) {
      if (this.bulletButton.isDown) {
        if (this.game.time.now > this.nextFire) {
          this.nextFire = game.time.now + this.fireRateBullet;
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
      this.vision.drawCircle(0, 0, 400);
    } else {
      this.vision.drawCircle(0, 0, 200);
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
      
      // Fijo el alcance de la bala izquierda
      var tweenLeft = this.game.add.tween(this.bulletLeft).to(null, this.fireRateBullet, null, false, 0, 0, false);
      var bulletLeft = this.bulletLeft;
      tweenLeft.onComplete.add(function() {
        bulletLeft.kill();
      });
      tweenLeft.start();

      // Fijo el alcance de la bala derecha
      var tweenRight = this.game.add.tween(this.bulletRight).to(null, this.fireRateBullet, null, false, 0, 0, false);
      var bulletRight = this.bulletRight;
      tweenRight.onComplete.add(function() {
        bulletRight.kill();
      });
      tweenRight.start();

    }
  }

    /* ------------------------- */
    /* ------- SUBMARINO ------- */
    /* ------------------------- */

    function Submarine (game, type, x, y) {
      Ship.call(this, game, type, x, y);

      this.fireRateBullet = 500;
      this.nextFire = 0;

      this.fireRateMissile = 4000;
      this.nextFireMissile = 0;

      this.vision = game.add.graphics(-1000, -1000);
      this.vision.beginFill(0x000000);
      this.vision.drawCircle(0, 0, 800);

      // Creo la bala
      this.bullet = this.game.add.sprite(0, 0, 'bullet');
      this.bullet.anchor.setTo(0.5, 0.5);
      this.bullet.exists = false;
      this.game.physics.arcade.enable(this.bullet);
      this.bullet.body.checkWorldBounds = true;
      this.bullet.outOfBoundsKill = true;

      // Creo el misil
      this.missile = this.game.add.sprite(0, 0, 'missile');
      this.missile.anchor.setTo(0.5, 0.5);
      this.missile.exists = false;
      this.game.physics.arcade.enable(this.missile);
      this.missile.body.checkWorldBounds = true;
      this.missile.outOfBoundsKill = true;

      this.bulletButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.missileButton = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);

  }

  Submarine.prototype = Object.create(Ship.prototype);
  Submarine.prototype.constructor = Submarine;
  Submarine.prototype.update = function(cursors) {
    Ship.prototype.update.call(this, cursors);

    if (this.bulletButton.isDown) {
      if (this.game.time.now > this.nextFire) {
        this.nextFire = game.time.now + this.fireRateBullet;
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

          //  Disparo la bala considerando la direccion del barco
          this.game.physics.arcade.velocityFromRotation(this.el.rotation, 500, this.bullet.body.velocity);
          
          var tween = this.game.add.tween(this.bullet).to(null, this.fireRateBullet, null, false, 0, 0, false);
          
          var bullet = this.bullet;
          tween.onComplete.add(function() {
            bullet.kill();
          });

          tween.start();
        }
      }

      Submarine.prototype.fireMissile = function() {

        if (this.el.alive) {
      // Verifico que el submarino siga vivo

      this.missile.reset(this.el.x, this.el.y);
      this.missile.rotation = this.el.rotation;

          //  Disparo el misil en la direccion del barco
          this.game.physics.arcade.velocityFromRotation(this.el.rotation, 500, this.missile.body.velocity);
          
          var tween = this.game.add.tween(this.missile).to(null, 500, null, false, 0, 0, false);
          
          var missile = this.missile;
          tween.onComplete.add(function() {
            missile.kill();
          });

          tween.start();
        }
      }

  // Variables de los barcos
  var submarine, blue, green, game;

  var init = function(_game) {
    game = _game;

    submarine = new Submarine(game, ShipsType.Submarine, 100, 300);
    blue = new CargoBoat(game, ShipsType.Blue, 200, 500);
    green = new CargoBoat(game, ShipsType.Green, 300, 700);
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
    getGreen: getGreen
  }
})();