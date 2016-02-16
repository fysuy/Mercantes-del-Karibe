(function() {
  var map, 
    mapWidth = 1000, 
    mapHeight = 1000,
    $mapContainer;

  var drawXAxisLines = function() {
    for (var i = 0; i < mapWidth; i++) {
      if (i % 50 == 0) {
        map.line(i, 0, i, 1000).addClass("axis");
      }
    }
  };

  var drawYAxisLines = function() {
    for (var i = 0; i < mapHeight; i++) {
      if (i % 50 == 0) {
        map.line(0, i, 1000, i).addClass("axis");
      }
    }
  };

  var init = function() {
    $mapContainer = $(".svg-container")[0];
    map = Snap(mapWidth, mapHeight);
    map.appendTo($mapContainer);

    drawXAxisLines();
    drawYAxisLines();
  };

  $(document).ready(function() {
    init();
  });
})();