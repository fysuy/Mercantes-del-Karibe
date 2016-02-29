var map = (function  () {
  var ny, mvd, caribbean, sea, mask, game;

  var maskLightOn, maskLightOff;

  var worldBounds = { 
    xTopLeft: 0,
    yTopLeft: 0,
    xBottomRight: 5000,
    yBottomRight: 5000
  };

  var generateSea = function() {
    // Creo el mar y le seteamos el color de fondo
    sea = game.add.graphics(0, 0); 
    sea.beginFill(0x2c8af4);
    sea.drawRect(worldBounds.xTopLeft, worldBounds.yTopLeft, worldBounds.xBottomRight, worldBounds.yBottomRight);
    sea.endFill();
  };

  var generateCaribbean = function() {
    // Pinta la zona del caribe
    caribbean = game.add.graphics(0, 0); 
    caribbean.beginFill(0x2275D3);
    caribbean.drawRect(worldBounds.xTopLeft, caribbean.yTop, worldBounds.xBottomRight, caribbean.yBottom - caribbean.yTop);
    caribbean.endFill();

    // Generamos los limites de la zona de caribe, 
    // El puerto de Mvd y NY son una 1/10 parte de la zona Caribe
    caribbean.yTop = Math.floor(worldBounds.yBottomRight / 10);
    caribbean.yBottom = worldBounds.yBottomRight - Math.floor(worldBounds.yBottomRight / 10);
  }

  var generateIslands = function(_admin) {
    var islands = [];

    caribbean.islands = game.add.group();

    // Seteo un valor random con la cantidad de islas
    var numberOfIslands = game.rnd.integerInRange(15, 30);
    
    var i = 0, x, y, width, height, island;

    // Genero las islas
    for (i; i < numberOfIslands; i++)
    {
      x = game.rnd.between(worldBounds.xBottomRight / numberOfIslands * i, 
        worldBounds.xBottomRight / numberOfIslands * (i + 1));

      y = game.rnd.between(caribbean.yTop, caribbean.yBottom)
      
      width = game.rnd.between(100, 400);
      height = game.rnd.between(100, 400);

      island = game.add.tileSprite(x, y, width, height, 'island');
      
      game.physics.arcade.enable(island);
      island.body.immovable = true;
      island.anchor.setTo(0.5, 0.5);
      caribbean.islands.add(island);
      
      islands.push({
        x: x,
        y: y,
        width: width,
        height: height
      });
    }

    if (_admin) {
      // Para el instalador que todo quede en http://localhost:8080/Mercantes-del-Karibe como base url 
      // (cliente y servidor) en tonces es mas sencillo el string del post
      $.post("http://192.168.1.46:8080/Mercantes-del-Karibe/rest/game/saveIslands", islands, function(response) {
        console.log(response);
      });
    }
  }

  var generatePorts = function() {
    ny = {}, mvd = {};

    // Creo la costa de Montevideo
    mvd.shore = game.add.tileSprite(worldBounds.xTopLeft, caribbean.yBottom, worldBounds.xBottomRight, caribbean.yTop, 'empty');
    game.physics.enable(mvd.shore, Phaser.Physics.ARCADE);
    mvd.shore.body.immovable = true;

    // Creo la costa de Nueva York
    ny.shore = game.add.tileSprite(worldBounds.xTopLeft, worldBounds.yTopLeft, worldBounds.xBottomRight, caribbean.yTop, 'empty');
    game.physics.enable(ny.shore, Phaser.Physics.ARCADE);
    ny.shore.body.immovable = true;

    // Pinta la tierra de new york
    ny.land = game.add.tileSprite(worldBounds.xTopLeft, worldBounds.yTopLeft, worldBounds.xBottomRight, 129, 'land');
    game.physics.enable(ny.land, Phaser.Physics.ARCADE);
    ny.land.body.setSize(worldBounds.xBottomRight, 135, 0, 0);
    ny.land.body.immovable = true;

    // Dibujo la linea del borde
    ny.land.line = game.add.graphics(0, 0); 
    ny.land.line.beginFill(0xE3F89A);
    ny.land.line.drawRect(worldBounds.xTopLeft, worldBounds.yTopLeft + 129, worldBounds.xBottomRight, 6);
    ny.land.line.endFill();

    // Dibujo el puerto de new york
    ny.port = game.add.sprite(game.rnd.between(worldBounds.xTopLeft, worldBounds.xBottomRight - 440), 0, 'port');
    game.physics.enable(ny.port, Phaser.Physics.ARCADE);
    ny.port.body.setSize(400, 60, 20, 135);
    ny.port.body.immovable = true;

    // Pinta la tierra de montevideo
    mvd.land = game.add.tileSprite(worldBounds.xTopLeft, worldBounds.yBottomRight - 129, worldBounds.xBottomRight, 129, 'land');
    game.physics.enable(mvd.land, Phaser.Physics.ARCADE);
    mvd.land.body.setSize(worldBounds.xBottomRight, 135, 0, -6);
    mvd.land.body.immovable = true;

    // Dibujo la linea del borde
    mvd.land.line = game.add.graphics(0, 0); 
    mvd.land.line.beginFill(0xE3F89A);
    mvd.land.line.drawRect(worldBounds.xTopLeft, worldBounds.yBottomRight - 135, worldBounds.xBottomRight, 6);
    mvd.land.line.endFill();

    // Dibujo el puerto de montevideo
    mvd.port = game.add.sprite(game.rnd.between(worldBounds.xTopLeft + 440, worldBounds.xBottomRight), worldBounds.yBottomRight, 'port');
    mvd.port.angle = 180;
  };

  var generateMask = function(_ship) {
    // Genero una mascara y la aplico al world
    // Esto determina la vision del barco
    mask = game.add.graphics(0, 0);
    mask.beginFill(0x000000);

    switch(_ship.type) {
      case ShipsType.Submarine: mask.drawCircle(0, 0, 800); break;
      case ShipsType.Blue: mask.drawCircle(0, 0, 400); break;
      case ShipsType.Green: mask.drawCircle(0, 0, 400); break;
      default: mask.drawCircle(0, 0, 600); break;
    }
    
    game.world.mask = mask;
  };

  var init = function (_game, _admin) {
    game = _game;

    game.stage.backgroundColor = '#000000';
    game.world.setBounds(0, 0, worldBounds.xBottomRight, worldBounds.yBottomRight);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    generateSea();
    generateCaribbean();
    generateIslands(_admin);
    generatePorts();
  };

  // Selectoras para los objetos


  var getCaribbean = function() { return caribbean; }
  var getNY = function() { return ny; }
  var getMvd = function() { return mvd; }
  var getMask = function() { return mask; }

  return {
    init: init,
    worldBounds: worldBounds,
    getCaribbean: getCaribbean,
    generateMask: generateMask,
    getNY: getNY,
    getMvd: getMvd,
    getMask: getMask
  }
})();