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

$('li').on("click", function(){
	$(this).toggleClass("active");
});

/*** MOVEBANK ***/

var loaded = false;
var jsonUrl = "http://www.movebank.org/movebank/service/public/json";
var study_id = 17707607;
var individual_local_identifiers = [117188, 117410, 126401, 126402, 126403, 126404, 126405, 126406, 126407];
var individual_local_names = ["117188", "117410", "126401", "126402", "126403", "126404", "126405", "126406", "126407"];
var colors = ["purple", "red", "yellow", "blue", "green", "orange", "pink", "lightblue", "brown"];

var timespan = 12; // months
var date = new Date();
var timestamp_end = date.getTime();
var date_start = new Date();
date_start = date_start.setMonth(date_start.getMonth() - timespan);
var timestamp_start = date_start;

var max_events_per_individual = 1;

$('#initial-load').on("click", function() {
	if(!loaded){
		$.getJSON(jsonUrl + "?callback=?", {
		  study_id: study_id,
		  individual_local_identifiers: individual_local_identifiers,
		  individual_local_names: individual_local_names,
		  max_events_per_individual : max_events_per_individual,
		  timestamp_start: timestamp_start,
		  timestamp_end: timestamp_end,
		  sensor_type: "gps"
		}, function (data0) {
		  data = data0;
		  loaded = true;
		  alert("Full Runthrough");
		});
	} else {
		alert('Movebank Data Loaded.')
	}
});
