var map = (function  () {
  var ny, mvd, sea, mask, game, 
  gameId, maskLightOn, maskLightOff;

  var loadedPorts = [], loadedIslands = [];

  var worldBounds = { 
    xTopLeft: 0,
    yTopLeft: 0,
    xBottomRight: 3000,
    yBottomRight: 7000
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
  };

  // Genero las islas y llamo al servicio que las guarda en la BD
  var generateIslands = function() {
    var numberOfIslands = getRandomInt(25, 40);
    var i = 0, x, y, width, height, islands = [];

    for (i; i < numberOfIslands; i++)
    {
      x = getRandomInt(worldBounds.xBottomRight / numberOfIslands * i, 
        worldBounds.xBottomRight / numberOfIslands * (i + 1));

      y = getRandomInt(caribbean.yTop, caribbean.yBottom)
      
      width = getRandomInt(100, 400);
      height = getRandomInt(100, 400);      
      
      islands.push({
        gameId: gameId,
        x: x,
        y: y,
        width: width,
        height: height
      });
    }

    loadedIslands = islands;

    var url = "rest/map/islands/" + gameId;
    return $.post(url, JSON.stringify(islands));
  }

  var saveMap = function() {
    var url = "rest/map/islands/" + gameId;
    var promisePorts = $.Deferred();
    var promiseIslands = $.Deferred();
    var promiseSave = $.Deferred();

    $.post(url, JSON.stringify(loadedIslands), function() {
      promiseIslands.resolve();
    });

    url = "rest/map/ports/" + gameId;
    $.post(url, JSON.stringify(loadedPorts), function() {
      promisePorts.resolve();
    });

    $.when(promiseIslands.done(), promisePorts.done()).done(function() {
      promiseSave.resolve();
    });

    return promiseSave;
  }

  // Obtengo las islas desde el servicio
  var getIslands = function() {
    var deferred = $.Deferred();
    
    var url = "rest/map/islands/" + gameId;
    $.get(url, function(response) {
      loadedIslands = response;
      deferred.resolve();
    });

    return deferred;
  }

  // Adjunto las islas al objeto juego
  var appendIslands = function(islands) {
    var isl;
    caribbean.islands = game.add.group();

    $.each(islands, function(i, island) {
      isl = game.add.tileSprite(island.x, island.y, island.width, island.height, 'island');
      game.physics.arcade.enable(isl);
      isl.body.immovable = true;
      isl.anchor.setTo(0.5, 0.5);
      caribbean.islands.add(isl);
    });
  }

  // Genero las coordenas de los puertos y llamo al servicio encargado
  // de guardarlas en BD
  var generatePorts = function() {
    var xNyPort, xMvdPort;

    xNyPort = getRandomInt(worldBounds.xTopLeft, worldBounds.xBottomRight - 440);
    xMvdPort = getRandomInt(worldBounds.xTopLeft + 440, worldBounds.xBottomRight);

    ports = [
      { name: 'ny', x: xNyPort },
      { name: 'mvd', x: xMvdPort }
    ];

    loadedPorts = ports;

    var url = "rest/map/ports/" + gameId;
    return $.post(url, JSON.stringify(ports));
  }

  // Obtengo las coordenas de los puertos
  var getPorts = function() {
    var deferred = $.Deferred();

    var url = "rest/map/ports/" + gameId;
    $.get(url, function(response) {
      loadedPorts = response;
      deferred.resolve();
    });

    return deferred;
  }

  var getLoadedPorts = function() {
    return loadedPorts;
  }

  // En base a las coordenas genero el resto de objetos relacionados a
  // los puertos.
  var appendPorts = function(ports) {
    var xMvdPort, xNyPort;

    $.each(ports, function(i, port) {
      if (port.name == "mvd") {
        xMvdPort = port.x;
      }

      if (port.name == "ny") {
        xNyPort = port.x;
      }
    });

    /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
    /* xMvdPort y xNyPort no quedan cargados */
    /* ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡ */

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

    console.log("dibujo puertos");
    console.log("MVD: " + xMvdPort + " NY: " + xNyPort);

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
  };

  var init = function (_game) {
    game = _game;

    game.stage.backgroundColor = '#0F3763';
    game.world.setBounds(0, 0, worldBounds.xBottomRight, worldBounds.yBottomRight);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    generateSea();
    generateCaribbean();
    appendIslands(loadedIslands);
    appendPorts(loadedPorts);
  };

  // Selectoras para los objetos
  var getCaribbean = function() { return caribbean; }
  var getNY = function() { return ny; }
  var getMvd = function() { return mvd; }
  var setGameId = function(id) { gameId = id; }

  return {
    init: init,
    worldBounds: worldBounds,
    getCaribbean: getCaribbean,
    getNY: getNY,
    getMvd: getMvd,
    generatePorts: generatePorts,
    generateIslands: generateIslands,
    getPorts: getPorts,
    getIslands: getIslands,
    getLoadedPorts: getLoadedPorts,
    setGameId: setGameId,
    saveMap: saveMap
  }
})();