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
		
		$('body').keydown(function(e){
			s = Snap("#svg");
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