// Base
var cities = {
	Marseille: 	new ol.proj.transform([5.3697800, 43.2964820], 'EPSG:4326', 'EPSG:3857'),
	Paris: 		  new ol.proj.transform([2.3522219, 48.8566140], 'EPSG:4326', 'EPSG:3857'),
	Rouen: 		  new ol.proj.transform([1.0999710, 49.4432320], 'EPSG:4326', 'EPSG:3857'),
	Strasbourg: new ol.proj.transform([7.7521, 48.5734], 'EPSG:4326', 'EPSG:3857'),
	Tokyo: 	    new ol.proj.transform([139.7690, 35.6804], 'EPSG:4326', 'EPSG:3857'),
};

var people = [
	{ name: "Dummy1", 		city: "Strasbourg"},
	{ name: "Dummy2", 		  city: "Rouen"},
	{ name: "Dummy0", 	city: "Rouen"},
	{ name: "Dummy3", 	city: "Paris"},
	{ name: "Dummy4", 	  city: "Tokyo"},
];