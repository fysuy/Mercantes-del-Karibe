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
      if (this.hasMoved && this.allowSend)  {
        webSocket.sendMessage(this.el.x, this.el.y, this.el.rotation);
        this.allowSend = false;
      }

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
    }
  }

  function CargoBoat(game, type, x, y) {
    Ship.call(this, game, type, x, y);
  }

  CargoBoat.prototype = Object.create(Ship.prototype);
  CargoBoat.prototype.constructor = CargoBoat;
  CargoBoat.prototype.update = function(cursors) {
    Ship.prototype.update.call(this, cursors);
  }

  function Submarine (game, type, x, y) {
    Ship.call(this, game, type, x, y);

    this.fireRateBullet = 500;
    this.nextFire = 0;

    this.bullet = this.game.add.sprite(0, 0, 'bullet');;
    this.bullet.anchor.setTo(0.5, 0.5);
    this.bullet.exists = false;
    this.game.physics.arcade.enable(this.bullet);
    this.bullet.body.checkWorldBounds = true;
    this.bullet.outOfBoundsKill = true;

    this.bulletButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.missile;
    this.missileButton = null;
  }

  Submarine.prototype = Object.create(Ship.prototype);
  Submarine.prototype.constructor = Submarine;
  Submarine.prototype.update = function(cursors) {
    Ship.prototype.update.call(this, cursors);

    if (this.bulletButton.isDown) {
      this.fireBullet();
    }
  }

  Submarine.prototype.fireBullet = function() {
    if (this.game.time.now > this.nextFire) {
        this.nextFire = game.time.now + this.fireRateBullet;
        this.bullet.reset(this.el.x, this.el.y);
        this.bullet.rotation = this.el.rotation;

        // var gunPointing = Math.PI * 1.5;  // Izquierda
        // var gunPointing = Math.PI * 0.5;  // Derecha
        var gunPointing = 0;              // Frente

        //  Disparo la bala considerando la direccion del barco
        this.game.physics.arcade.velocityFromRotation(this.el.rotation + gunPointing, 500, this.bullet.body.velocity);
        
        var tween = this.game.add.tween(this.bullet).to(null, this.fireRateBullet, null, false, 0, 0, false);
        
        var bullet = this.bullet;
        tween.onComplete.add(function() {
          bullet.kill();
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
    //green = new Ship(game, 'red', 300, 700);
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