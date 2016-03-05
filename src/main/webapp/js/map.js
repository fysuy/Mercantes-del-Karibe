var map = (function  () {
  var ny, mvd, sea, mask, game;

  var maskLightOn, maskLightOff;

  var worldBounds = { 
    xTopLeft: 0,
    yTopLeft: 0,
    xBottomRight: 5000,
    yBottomRight: 5000
  };

  // Generamos los limites de la zona de caribe, 
  // El puerto de Mvd y NY son una 1/10 parte de la zona Caribe
  var caribbean = { 
    yTop: Math.floor(worldBounds.yBottomRight / 10),
    yBottom: worldBounds.yBottomRight - Math.floor(worldBounds.yBottomRight / 10)
  };

  var generateSea = function() {
    // Creo el mar y le seteamos el color de fondo
    sea = game.add.tileSprite(worldBounds.xTopLeft, 
                              worldBounds.yTopLeft, 
                              worldBounds.xBottomRight, 
                              worldBounds.yBottomRight, 
                              'water'); 
  };

  var generateCaribbean = function() {
    // Pinta la zona del caribe
    caribbeanPaint = game.add.graphics(0, 0); 
    caribbeanPaint.beginFill(0x000000);
    caribbeanPaint.drawRect(worldBounds.xTopLeft, caribbean.yTop, worldBounds.xBottomRight, caribbean.yBottom - caribbean.yTop);
    caribbeanPaint.alpha = 0.1;
    caribbeanPaint.endFill();
  }

  var generateIslands = function(_admin) {
    var island;

    caribbean.islands = game.add.group();

    if (_admin) {
      var islands = [];

      // Seteo un valor random con la cantidad de islas
      var numberOfIslands = game.rnd.integerInRange(15, 30);
      
      var i = 0, x, y, width, height;

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

      $.post("rest/map/islands/save", JSON.stringify(islands));

    } else {
      $.get("rest/map/islands", function(islands) {
        $.each(islands, function(i, island) {
          isl = game.add.tileSprite(island.x, island.y, island.width, island.height, 'island');
          game.physics.arcade.enable(isl);
          isl.body.immovable = true;
          isl.anchor.setTo(0.5, 0.5);
          caribbean.islands.add(isl);
        });
      });
    }
  }

  var generatePorts = function(_admin) {
    var deferred = $.Deferred();
    var xNyPort, xMvdPort;

    if (_admin) {
      xNyPort = game.rnd.between(worldBounds.xTopLeft, worldBounds.xBottomRight - 440);
      xMvdPort = game.rnd.between(worldBounds.xTopLeft + 440, worldBounds.xBottomRight);

      var ports = [
        { name: 'ny', x: xNyPort },
        { name: 'mvd', x: xMvdPort }
      ];

      $.post("rest/map/ports/save", JSON.stringify(ports));
      deferred.resolve(xNyPort, xMvdPort);
    } else {
      $.get("rest/map/ports", function(ports) {
        $.each(ports, function(i, port) {
          switch(port.name) {
            case 'ny': xNyPort = port.x; break;
            case 'mvd': xMvdPort = port.x; break;
          }
        });

        deferred.resolve(xNyPort, xMvdPort);
      });
    }

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
    ny.land.line.beginFill(0x676767);
    ny.land.line.drawRect(worldBounds.xTopLeft, worldBounds.yTopLeft + 129, worldBounds.xBottomRight, 6);
    ny.land.line.endFill();
    // Dibujo la linea del borde
    ny.land.line2 = game.add.graphics(0, 0); 
    ny.land.line2.beginFill(0x000000);
    ny.land.line2.drawRect(worldBounds.xTopLeft, worldBounds.yTopLeft + 135, worldBounds.xBottomRight, 12);
    ny.land.line2.endFill();
    ny.land.line2.alpha = 0.1;

    // Pinta la tierra de montevideo
    mvd.land = game.add.tileSprite(worldBounds.xTopLeft, worldBounds.yBottomRight - 129, worldBounds.xBottomRight, 129, 'land');
    game.physics.enable(mvd.land, Phaser.Physics.ARCADE);
    mvd.land.body.setSize(worldBounds.xBottomRight, 135, 0, -6);
    mvd.land.body.immovable = true;

    // Dibujo la linea del borde
    mvd.land.line = game.add.graphics(0, 0); 
    mvd.land.line.beginFill(0x676767);
    mvd.land.line.drawRect(worldBounds.xTopLeft, worldBounds.yBottomRight - 135, worldBounds.xBottomRight, 6);
    mvd.land.line.endFill();
    // Dibujo la linea del borde
    mvd.land.line2 = game.add.graphics(0, 0); 
    mvd.land.line2.beginFill(0x000000);
    mvd.land.line2.drawRect(worldBounds.xTopLeft, worldBounds.yTopLeft - 147, worldBounds.xBottomRight, 12);
    mvd.land.line2.endFill();
    mvd.land.line2.alpha = 0.1;

    deferred.done(function(xNyPort, xMvdPort) {
      // Dibujo el puerto de new york
      ny.port = game.add.sprite(xNyPort, 0, 'port');
      game.physics.enable(ny.port, Phaser.Physics.ARCADE);
      ny.port.body.setSize(400, 60, 20, 135);
      ny.port.body.immovable = true;

      // Dibujo el puerto de montevideo
      mvd.port = game.add.sprite(xMvdPort, worldBounds.yBottomRight, 'port');
      mvd.port.angle = 180;
      game.physics.enable(mvd.port, Phaser.Physics.ARCADE);
      mvd.port.body.setSize(400, 60, 20, 135);
      mvd.port.body.immovable = true;
    });   
  };

  var init = function (_game, _admin) {
    game = _game;

    game.stage.backgroundColor = '#0F3763';
    game.world.setBounds(0, 0, worldBounds.xBottomRight, worldBounds.yBottomRight);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    generateSea();
    generateCaribbean();
    generateIslands(_admin);
    generatePorts(_admin);
  };

  // Selectoras para los objetos


  var getCaribbean = function() { return caribbean; }
  var getNY = function() { return ny; }
  var getMvd = function() { return mvd; }

  return {
    init: init,
    worldBounds: worldBounds,
    getCaribbean: getCaribbean,
    getNY: getNY,
    getMvd: getMvd
  }
})();