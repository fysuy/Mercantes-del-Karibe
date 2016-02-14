(function  () {
	// First lets create our drawing surface out of existing SVG element
	// If you want to create new surface just provide dimensions
	// like s = Snap(800, 600);
	var s;
	
	$(document).ready(function(){
		$.get("rest/game", function(data) {
			$(".svg-container").append(data);

			s = Snap("#svg");
			var galleon = s.select("#ship");
		});
		
		$('body').keydown(function(e){
			var galleon = s.select("#ship");
			switch(e.which){
				case 38: 
					galleon.animate({y: 100}, 2000);
					break;
				case 40: 
					galleon.animate({y: -100}, 2000);
					break;
				case 39: 
					galleon.animate({x: 100}, 2000);
					break;
				case 37: 
					galleon.animate({x: -100}, 2000);
					break;
			}
		});
	});
})();