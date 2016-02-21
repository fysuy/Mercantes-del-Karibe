var appJs = (function  () {
    var map;

    var keysCharcode = {
      UP : 38,
      DOWN : 40,
      RIGHT : 39,
      LEFT: 37
    }

    var drawShip = function() {
      Snap.load("assets/ship-grey-02.svg", function(ship) {
        //var g = ship.select("g")
                    //ship.addClass("ship submarine");
                    //.transform().localMatrix.translate(100,100)
                    //.transform("t100,100");
                    //+ 100 + ship.cx + "," + 100 + ship.cy
        mapJs.getMap().append(ship);
      });
    };

    var distanceBetweenAngles = function(alpha, beta) {
        var phi = Math.abs(beta - alpha) % 360;
        var distance = phi > 180 ? 360 - phi : phi;
        return distance;
    }

    var rotate = function(el, a, cx, cy, callback) {
      var tstr = "r" + a + "," + cx + "," + cy;

      el.animate({ r: a }, 1000, mina.linear, function() {
        if (callback) { callback() };
      })

      // el.animate({ transform: tstr }, 1000, mina.easein, function() {
      //   el.transform().localMatrix.rotate(a, cx, cy);
      //   el.transform(el.transform().localMatrix.toTransformString());
      //   el.transform().localMatrix.add(el.transform().localMatrix.toTransformString());

      //   //el.data("transform", tstr);
        
      //   if(callback) {
      //     callback();
      //   }
      // });
    }

    var translate = function(el, x, y, callback) {
      var tstr = "t" + x + "," + y;

      el.animate({ transform: tstr }, 1000, mina.easein, function() {
        el.transform().localMatrix.translate(x, y);
        el.transform(el.transform().localMatrix.toTransformString());
        if(callback) {
          callback();
        }
      });
    }

    var translateX = function(el, x) {
      el.animate({ x: x }, 1000, mina.linear);
    };

    var translateY = function(el, y) {
      el.animate({ y: y }, 1000, mina.linear);
    };

    var init = function() {
      mapJs.initMap();
      
      drawShip();

      $('body').keydown(function(e) {
        var r;
        var galleon = Snap.select(".submarine");
        var coord = galleon.getBBox();  
        var localMatrix = galleon.transform().localMatrix;

        switch(e.which) {
          case keysCharcode.UP: 
            event.preventDefault();
            r = distanceBetweenAngles(0, localMatrix.split().rotate);
            localMatrix.rotate(r, coord.cx, coord.cy);
            galleon.animate({ transform: localMatrix.toTransformString() }, 1000, mina.linear,
              function() {
                localMatrix.translate(coord.x + 100, coord.cy);
                galleon.animate({ transform: localMatrix.toTransformString() });
              });
            break;
          case keysCharcode.DOWN: 
            event.preventDefault();
            r = distanceBetweenAngles(180, localMatrix.split().rotate);
            rotate(galleon, r, coord.cx, coord.cy, function() {
              translateY(galleon,100);
            });
            break;
          case keysCharcode.RIGHT: 
            event.preventDefault();
            r = distanceBetweenAngles(270, localMatrix.split().rotate);             
            localMatrix.rotate(r, coord.cx, coord.cy);
            galleon.animate({ 
              transform: localMatrix.toTransformString() },
              1000, 
              mina.linear,
              function() {
                localMatrix.translate(coord.x + 100, coord.cy);
                galleon.animate({ transform: localMatrix.toTransformString() });
              });
            break;
          case keysCharcode.LEFT: 
            r = distanceBetweenAngles(360, localMatrix.split().rotate);
            localMatrix.rotate(r, coord.cx, coord.cy);
            galleon.animate({ 
              transform: localMatrix.toTransformString() },
              1000, 
              mina.linear,
              function() {
                localMatrix.translate(coord.x + 100, coord.cy);
                galleon.animate({ transform: localMatrix.toTransformString() });
              });
            break;
        }
      });
    };

    return {
      initApp: init
    }
})();

$(document).ready(function() {
  appJs.initApp();
});