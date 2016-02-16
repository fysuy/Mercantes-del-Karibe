(function  () {
	// First lets create our drawing surface out of existing SVG element
	// If you want to create new surface just provide dimensions
	// like s = Snap(800, 600);
	var s;
	
	$(document).ready(function(){
//		$.get("rest/game", function(data) {
//			$(".svg-container").append(data);
//
//			s = Snap("#svg");
//			var galleon = s.select("#ship");
//		});

		s = Snap("#svg");
		
		var svgWidth = 1000;
		var svgHeight = 1000;
		
		var xAxisLine;
		
		for (var i = 0; i < svgWidth; i++) {
			if (i % 50 == 0) {
				xAxisLine = s.line(i, 0, i, 1000).attr({ fill: "red", stroke: "red" });
			}
		}
		
		for (var i = 0; i < svgHeight; i++) {
			if (i % 50 == 0) {
				xAxisLine = s.line(0, i, 1000, i).attr({ fill: "red", stroke: "red" });
			}
		}
		
		$('body').keydown(function(e){
			
			var galleon = s.select("#ship");
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