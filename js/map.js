
/*** 
 ::: Eagle Map w/ git 
 ::: Active Development 07/22 mailto:esamsoe@gmail.com 
***/

var map;
var data;

$(document).ready(function($) {
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
});


/*** MOVEBANK ***/


var jsonUrl = "http://www.movebank.org/movebank/service/public/json";
var study_id = 17707607;
var individual_local_identifiers = [117188, 117410, 126401, 126402, 126403, 126404, 126405, 126406, 126407];
var individual_local_names = ["117188", "117410", "126401", "126402", "126403", "126404", "126405", "126406", "126407"];
var colors = ["purple", "red", "yellow", "blue", "green", "orange", "pink", "lightblue", "brown"];

var timespan = 10; // days
var date = new Date();
var timestamp_end = date.getTime();
var date_start = new Date();
date_start = date_start.setDate(date_start.getDate() - timespan);
var timestamp_start = date_start;

var max_events_per_individual;
var loaded = false;

$('#initial-load').on("click", function() {
	data = [];
	max_events_per_individual = 1;
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

	/* more loading */
	for (i = 0; i < data.individuals.length; i++) {
		data.individuals[i].color = colors[i];
		//data.individuals[i].name = name[i]; // no eagle names so far
	}

	createMarkers();
	createPolylines();
	showCurrent();                

	startDate = null;
	endDate = null;
	for (i = 0; i < data.individuals.length; i++) {
	    for (j = 0; j < data.individuals[i].locations.length; j++) {
	        ts = data.individuals[i].locations[j].timestamp;
	        if (startDate != null) {
	            startDate = Math.min(startDate, ts);
	            endDate = Math.max(endDate, ts);
	        } else {
	            startDate = ts;
	            endDate = ts;
	        }
	    }
	}
	for (i = 0; i < data.individuals.length; i++)
	    showClosestPointInTime(data.individuals[i], endDate);

	});
});

$('#multi-day').on("click", function() {
	data = [];
	max_events_per_individual = 700;
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

	/* more loading */
	for (i = 0; i < data.individuals.length; i++) {
		data.individuals[i].color = colors[i];
		//data.individuals[i].name = name[i]; // no eagle names so far
	}

	createMarkers();
	createPolylines();
	showCurrent();                

	startDate = null;
	endDate = null;
	for (i = 0; i < data.individuals.length; i++) {
	    for (j = 0; j < data.individuals[i].locations.length; j++) {
	        ts = data.individuals[i].locations[j].timestamp;
	        if (startDate != null) {
	            startDate = Math.min(startDate, ts);
	            endDate = Math.max(endDate, ts);
	        } else {
	            startDate = ts;
	            endDate = ts;
	        }
	    }
	}
	for (i = 0; i < data.individuals.length; i++)
	    showClosestPointInTime(data.individuals[i], endDate);

	});
});

function createMarkers() {
    for (i = 0; i < data.individuals.length; i++) {
        data.individuals[i].marker = new google.maps.Marker({
            clickable: true,
            draggable: true,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 0.7,
                fillColor: data.individuals[i].color,
                strokeWeight: 1,
                strokeOpacity: 0.5,
                strokeColor: 'white',
                scale: 6
            },
            optimized: true
        });

        data.individuals[i].marker.setPosition(new google.maps.LatLng(null, null));
        data.individuals[i].marker.setTitle(data.individuals[i].individual_local_identifier);
        google.maps.event.addListener(data.individuals[i].marker, "click", (function (individual) {
            return function () {
                showInfo(individual);
            };
        })(data.individuals[i]));
        //data.individuals[i].marker.setVisible(false);
    }
    setBounds();
}

function setBounds() {
    var bounds = new google.maps.LatLngBounds();
    for (i = 0; i < data.individuals.length; i++) {
        for (j = 0; j < data.individuals[i].locations.length; j++) {
            bounds.extend(new google.maps.LatLng(
                data.individuals[i].locations[j].location_lat,
                data.individuals[i].locations[j].location_long));
        }
    }
    map.fitBounds(bounds);
}

function createPolylines() {
    for (i = 0; i < data.individuals.length; i++) {
        var track = [];
        for (j = 0; j < data.individuals[i].locations.length; j++) {
            track[j] = new google.maps.LatLng(
                data.individuals[i].locations[j].location_lat,
                data.individuals[i].locations[j].location_long);
        }
        icons = [{
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                },
                offset: 0,
                repeat: '100px'
            }
        ];
        data.individuals[i].polyline = new google.maps.Polyline({
            path: track,
            clickable: true,
            strokeColor: data.individuals[i].color,
            strokeOpacity: 0.5,
            strokeWeight: 3
            //icons : icons
        });
        //data.individuals[i].polyline.setMap(null);
        google.maps.event.addListener(data.individuals[i].polyline, 'click', (function (
            individual) {
            return function (e) {
                showClosestPointInSpace(individual, e.latLng, true);
                showInfo(individual);
            };
        })(data.individuals[i]));

        console.log(data.individuals[i].locations.length);
    }
}

function showCurrent() {
    // data.individuals[i].marker.setVisible(true);
    for (i = 0; i < data.individuals.length; i++) {
        data.individuals[i].marker.setVisible(true);
        data.individuals[i].polyline.setMap(map);
    }
}

function showClosestPointInTime(individual, t) {
    var distCurr = 1000 * 1000 * 1000 * 1000;
    var indexCurr;
    for (j = 0; j < individual.locations.length; j++) {
        dist0 = Math.abs(t - individual.locations[j].timestamp);
        if (dist0 < distCurr) {
            indexCurr = j;
            distCurr = dist0;
        }
    }
    if (indexCurr == 0)
        indexStart = 1;
    else
        indexStart = indexCurr - 1;
    if (indexCurr == individual.locations.length - 1)
        indexEnd = individual.locations.length - 2;
    else
        indexEnd = indexCurr + 1;
    indexClosest = indexCurr;
    distClosest = distCurr;
    distCurr = 1000 * 1000 * 1000;
    for (j = indexStart; j <= indexEnd; j += 2) {
        dist0 = Math.abs(t - individual.locations[j].timestamp);
        if (dist0 < distCurr) {
            indexCurr = j;
            distCurr = dist0;
        }
    }
    indexSecondClosest = indexCurr;
    distSecondClosest = distCurr;
    x0 = individual.locations[indexClosest].location_long;
    y0 = individual.locations[indexClosest].location_lat;
    x1 = individual.locations[indexSecondClosest].location_long;
    y1 = individual.locations[indexSecondClosest].location_lat;
    x = (x0 * distSecondClosest + x1 * distClosest) / (distClosest + distSecondClosest);
    y = (y0 * distSecondClosest + y1 * distClosest) / (distClosest + distSecondClosest);
    individual.marker.setPosition(new google.maps.LatLng(y, x));
    individual.marker.timestamp = t;
    if (individual.marker.getMap() == null)
        individual.marker.setMap(map);
    gracePeriod = 1000 * 60 * 60 * 24 * 2;
    if (t + gracePeriod < individual.locations[0].timestamp || t - gracePeriod > individual.locations[individual.locations.length - 1].timestamp)
        individual.marker.setMap(null);
}

function showInfo(individual) {
    wasOpen = (individual.info != null);
    hideInfos();
    if (!wasOpen && individual.marker) {
        individual.info = new google.maps.InfoWindow();
        updateInfo(individual);
        individual.info.open(map, individual.marker);
    }
}

function hideInfos() {
    for (i = 0; i < data.individuals.length; i++) {
        if (data.individuals[i].info) {
            data.individuals[i].info.close();
            data.individuals[i].info = null;
        }
    }
}

function updateInfo(individual) {
    if (individual.info && individual.marker) {
        tsFirst = individual.locations[0].timestamp;
        tsLast = individual.locations[individual.locations.length - 1].timestamp;
        ts = individual.marker.timestamp;
        if (ts < tsFirst)
            ts = tsFirst;
        if (ts > tsLast)
            ts = tsLast;
        individual.info.setContent("<div style='width:101px;height:40px;'><b>" + individual.name + "</b>" + "<br>" + "Date: " + formatTimestamp(ts) + "</div>");
    }
}

function showClosestPointInSpace(individual, latLng, snapToPoint) {
    var distCurr = 1000 * 1000 * 1000 * 1000;
    var indexCurr;
    for (j = 0; j < individual.locations.length; j++) {
        latLng0 = new google.maps.LatLng(
            individual.locations[j].location_lat,
            individual.locations[j].location_long);
        dist0 = google.maps.geometry.spherical.computeDistanceBetween(
            latLng, latLng0);
        if (dist0 < distCurr) {
            indexCurr = j;
            distCurr = dist0;
        }
    }
    if (indexCurr == 0)
        indexStart = 1;
    else
        indexStart = indexCurr - 1;
    if (indexCurr == individual.locations.length - 1)
        indexEnd = individual.locations.length - 2;
    else
        indexEnd = indexCurr + 1;
    indexClosest = indexCurr;
    distCurr = 1000 * 1000 * 1000 * 1000;
    for (j = indexStart; j <= indexEnd; j += 2) {
        latLng0 = new google.maps.LatLng(
            individual.locations[j].location_lat,
            individual.locations[j].location_long);
        dist0 = google.maps.geometry.spherical.computeDistanceBetween(
            latLng, latLng0);
        if (dist0 < distCurr) {
            indexCurr = j;
            distCurr = dist0;
        }
    }
    indexSecondClosest = indexCurr;
    if (snapToPoint)
        indexSecondClosest = indexClosest;
    pointOnLine = getPointClosestToLine(
        individual.locations[indexClosest].location_long,
        individual.locations[indexClosest].location_lat,
        individual.locations[indexSecondClosest].location_long,
        individual.locations[indexSecondClosest].location_lat,
        latLng.lng(), latLng.lat());
    individual.marker.setPosition(new google.maps.LatLng(pointOnLine.y,
        pointOnLine.x));
    if (individual.marker.getMap() == null)
        individual.marker.setMap(map);
    latLngClosest = new google.maps.LatLng(
        individual.locations[indexClosest].location_lat,
        individual.locations[indexClosest].location_long);
    distClosest = google.maps.geometry.spherical
        .computeDistanceBetween(latLng, latLngClosest);
    latLngSecondClosest = new google.maps.LatLng(
        individual.locations[indexSecondClosest].location_lat,
        individual.locations[indexSecondClosest].location_long);
    distSecondClosest = google.maps.geometry.spherical
        .computeDistanceBetween(latLng, latLngSecondClosest);
    t = (individual.locations[indexClosest].timestamp * distSecondClosest + individual.locations[indexSecondClosest].timestamp * distClosest) / (distClosest + distSecondClosest);
    individual.marker.timestamp = t;
    for (i = 0; i < data.individuals.length; i++)
        if (data.individuals[i] != individual)
            showClosestPointInTime(data.individuals[i], t);
    $('#time-display').datepicker('setDate', new Date(t));
}

function formatTimestamp(timestamp) {
    var date = new Date(timestamp);
    var ss = date.getSeconds();
    var mi = date.getMinutes();
    var hh = date.getHours();
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (ss < 10) {
        ss = '0' + ss;
    }
    if (mi < 10) {
        mi = '0' + mi;
    }
    if (hh < 10) {
        hh = '0' + hh;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return mm + "-" + dd + "-" + yyyy;
}

function getPointClosestToLine(x1, y1, x2, y2, x3, y3) {
    dx = x2 - x1;
    dy = y2 - y1;
    if ((dx == 0) && (dy == 0)) {
        x0 = x1;
        y0 = y1;
    } else {
        t = ((x3 - x1) * dx + (y3 - y1) * dy) / (dx * dx + dy * dy);
        t = Math.min(Math.max(0, t), 1);
        x0 = x1 + t * dx;
        y0 = y1 + t * dy;
    }
    return {
        x: x0,
        y: y0
    };
}

Date.prototype.getDOY = function() {
var onejan = new Date(this.getFullYear(),0,1);
return Math.ceil((this - onejan) / 86400000);
}


/*** Buttons ***/


$('li').on("click", function(){
	$(this).toggleClass("active");
});