var appJs = (function  () {
  var $container = $(".game-container");
  var game = new Phaser.Game(800, 600, Phaser.AUTO, "game-container", { preload: preload, create: create, update: update });

  var ocean;
  var submarine;
  var shadow;

  var currentSpeed = 0;

  function preload() {
    game.load.image('ocean', 'assets/pattern-land.png');
    game.load.image('submarine', 'assets/ship-grey.png');
  }

  function create() {
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    ocean = game.add.tileSprite(0, 0, 800, 600, 'ocean');
    ocean.fixedToCamera = true;

    submarine = game.add.sprite(0, 0, 'submarine', 'submarine');
    submarine.anchor.setTo(0.5, 0.5);
    submarine.animations.add('move', ['submarine'], 20, true);

    //  This will force it to decelerate and limit its speed
    game.physics.enable(submarine, Phaser.Physics.ARCADE);
    submarine.body.drag.set(0.2);
    submarine.body.maxVelocity.setTo(400, 400);
    submarine.body.collideWorldBounds = true;

    game.camera.follow(submarine);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
  }

  function update() {
    if (cursors.left.isDown)
    {
        submarine.angle -= 4;
    }
    else if (cursors.right.isDown)
    {
        submarine.angle += 4;
    }

    if (cursors.up.isDown)
    {
        //  The speed we'll travel at
        currentSpeed = 300;
    }
    else
    {
        if (currentSpeed > 0)
        {
            currentSpeed -= 4;
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