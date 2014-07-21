var map;
function initialize() {
	var mapOptions = {
		zoom: 9,
		center: new google.maps.LatLng(46.692, -114.015),
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		mapTypeControl: true,
	    mapTypeControlOptions: {
	        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
	        position: google.maps.ControlPosition.TOP_CENTER
	    },
	    panControl: true,
	    panControlOptions: {
	        position: google.maps.ControlPosition.RIGHT_TOP
	    },
	    streetViewControl: true,
	    streetViewControlOptions: {
	        position: google.maps.ControlPosition.RIGHT_TOP
	    },
	    zoomControl: true,
	    zoomControlOptions: {
	        style: google.maps.ZoomControlStyle.LARGE,
	        position: google.maps.ControlPosition.RIGHT_TOP
	    },
	    scaleControl: true
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);