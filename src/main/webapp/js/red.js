var appJs = (function  () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, "game-container", { preload: preload, create: create, update: update });

  var ocean, port, red, shadowTexture;

  var currentSpeed = 0;
  var LIGHT_RADIUS = 100;

  $(document).ready(function() {
    $("#btnLight").click(function(event) {
      event.preventDefault();
      game.camera.scale = new Phaser.Point(100, 100);
    });
  });

  var distanceBetweenAngles = function(alpha, beta) {
    var phi = Math.abs(beta - alpha) % 360;
    var distance = phi > 180 ? 360 - phi : phi;
    return distance;
  };

  function preload() {
    game.load.image('ocean', 'assets/pattern-land.png');
    game.load.image('port', 'assets/port.png');
    game.load.image('red', 'assets/ship-red.png');
  }

  function create() {
    game.world.setBounds(0, 0, 10000, 10000);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    game.physics.startSystem(Phaser.Physics.ARCADE);

    ocean = game.add.tileSprite(0, 0, 800, 600, 'ocean');
    ocean.fixedToCamera = true;

    red = game.add.sprite(100, 300, 'red');
    red.anchor.setTo(0.5, 0.5);
    game.physics.enable(red, Phaser.Physics.ARCADE);
    red.body.collideWorldBounds = true;

    port = game.add.sprite(0, 0, 'port');
    game.physics.enable(port, Phaser.Physics.ARCADE);
    port.body.collideWorldBounds = true;

    game.camera.follow(red);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

    shadowTexture = game.add.bitmapData(game.width, game.height);
    lightSprite = game.add.image(0, 0, shadowTexture);
    lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    game.input.activePointer.x = red.x;
    game.input.activePointer.y = red.y;
  }

  var updateShadowTexture = function() {
    shadowTexture.context.fillStyle = 'rgb(100, 100, 100)';
    shadowTexture.context.fillRect(0, 0, game.width, game.height);

    // Draw circle of light
    shadowTexture.context.beginPath();
    shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
    shadowTexture.context.arc(red.x, red.y, LIGHT_RADIUS, 0, Math.PI*2);
    shadowTexture.context.fill();

    // This just tells the engine it should update the texture cache
    shadowTexture.dirty = true;
};

  function update() {
    game.physics.arcade.collide(port, red);
    updateShadowTexture();

    // if (cursors.left.isDown)
    // {
    //   currentSpeed = 300;
    //   if ((red.angle > 0) && (red.angle < 90)) {
    //     red.angle += 4;   
    //   }
    // }
    // else if (cursors.right.isDown)
    // {
    //   currentSpeed = 300;
    //   red.angle += 4;
    // } else {
    //     if (currentSpeed > 0)
    //     {
    //       currentSpeed -= 4;
    //     }
    // }

    if (cursors.left.isDown)
    {
      currentSpeed = 300;
      red.angle = 180;
    }
    else if (cursors.right.isDown)
    {
      currentSpeed = 300;
      red.angle = 0;
    }
    else if (cursors.down.isDown)
    {
      currentSpeed = 300;
      red.angle = 90;
    }
    else if (cursors.up.isDown)
    {
      currentSpeed = 300;
      red.angle = -90;
    } else {
      if (currentSpeed > 0) {
        currentSpeed -= 5;
      } else {
        red.body.velocity.x = 0;
        red.body.velocity.y = 0;
      }
    }

    if (currentSpeed > 0)
    {
      game.physics.arcade.velocityFromRotation(red.rotation, currentSpeed, red.body.velocity);
    }

    ocean.tilePosition.x = -game.camera.x;
    ocean.tilePosition.y = -game.camera.y;
  }   
})();