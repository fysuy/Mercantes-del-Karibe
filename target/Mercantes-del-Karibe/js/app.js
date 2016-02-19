var appJs = (function  () {
  $(document).ready(function(){		

    var drawShip = function() {
      Snap.load("assets/ship-grey.svg", function(ship) {
        mapJs.map.append(ship);
      });
    };


    drawShip();

    $('body').keydown(function(e){
      var galleon = mapJs.map.select("#ship");
      var coord = galleon.getBBox();
      switch(e.which){
        case 38: 
          event.preventDefault();
          galleon.animate({ y: coord.y - 100 }, 2000);
          break;
        case 40: 
          event.preventDefault();
          galleon.animate({ y: coord.y + 100 }, 2000);
          break;
        case 39: 
          event.preventDefault();
          galleon.animate({ x: coord.x + 100 }, 2000);
          break;
        case 37: 
          event.preventDefault();
          galleon.animate({ x: coord.x - 100 }, 2000);
          break;
      }
    });
  });
})();