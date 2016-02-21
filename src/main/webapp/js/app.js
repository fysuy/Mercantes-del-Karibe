var appJs = (function  () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, "game-container", { preload: preload, create: create, update: update });

  var ocean, port, submarine;

  var currentSpeed = 0;

  var distanceBetweenAngles = function(alpha, beta) {
    var phi = Math.abs(beta - alpha) % 360;
    var distance = phi > 180 ? 360 - phi : phi;
    return distance;
  };

  function preload() {
    game.load.image('ocean', 'assets/pattern-land.png');
    game.load.image('port', 'assets/port.png');
    game.load.image('submarine', 'assets/ship-grey.png');
  }

  function create() {
    game.world.setBounds(0, 0, 10000, 10000);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    game.physics.startSystem(Phaser.Physics.ARCADE);

    ocean = game.add.tileSprite(0, 0, 800, 600, 'ocean');
    ocean.fixedToCamera = true;

    submarine = game.add.sprite(100, 300, 'submarine');
    submarine.anchor.setTo(0.5, 0.5);
    game.physics.enable(submarine, Phaser.Physics.ARCADE);
    submarine.body.collideWorldBounds = true;

    port = game.add.sprite(0, 0, 'port');
    game.physics.enable(port, Phaser.Physics.ARCADE);
    port.body.collideWorldBounds = true;

    game.camera.follow(submarine);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
  }

  function update() {
    game.physics.arcade.collide(port, submarine);

    // if (cursors.left.isDown)
    // {
    //   currentSpeed = 300;
    //   if ((submarine.angle > 0) && (submarine.angle < 90)) {
    //     submarine.angle += 4;   
    //   }
    // }
    // else if (cursors.right.isDown)
    // {
    //   currentSpeed = 300;
    //   submarine.angle += 4;
    // } else {
    //     if (currentSpeed > 0)
    //     {
    //       currentSpeed -= 4;
    //     }
    // }

    if (cursors.left.isDown)
    {
      currentSpeed = 300;
      submarine.angle = 180;
    }
    else if (cursors.right.isDown)
    {
      currentSpeed = 300;
      submarine.angle = 0;
    }
    else if (cursors.down.isDown)
    {
      currentSpeed = 300;
      submarine.angle = 90;
    }
    else if (cursors.up.isDown)
    {
      currentSpeed = 300;
      submarine.angle = -90;
    } else {
      if (currentSpeed > 0) {
        currentSpeed -= 5;
      } else {
        submarine.body.velocity.x = 0;
        submarine.body.velocity.y = 0;
      }
    }

    if (currentSpeed > 0)
    {
      game.physics.arcade.velocityFromRotation(submarine.rotation, currentSpeed, submarine.body.velocity);
    }

    ocean.tilePosition.x = -game.camera.x;
    ocean.tilePosition.y = -game.camera.y;
  }   
})();