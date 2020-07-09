// cities : key = name ; value = coordinate projection

//
//  INITIALISATION
//

// City Markers
var iconStyle = {
  Default:
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12,
          stroke: new ol.style.Stroke({
            color: [210, 100, 100],
            width: 2
          }),
          fill: new ol.style.Fill({
            color: [0, 0, 0, 0]
          })
        }),
      }),
  Clicked:
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 12,
      stroke: new ol.style.Stroke({
        color: [210, 100, 100],
        width: 3
      }),
      fill: new ol.style.Fill({
        color: [210, 100, 100]
      })
    }),
  }),
};

// Markers populate
var markers=[];

populateMarkers();
function populateMarkers() {
  for(var key in cities) {
    var mark = new ol.Feature({
      title: key,
      geometry: new ol.geom.Point(cities[key]),
    });
    mark.setStyle(iconStyle['Default']);
    markers.push(mark);
  }
}

var vectorSource = new ol.source.Vector({
      features: markers,
});

// Popup
var overlay = new ol.Overlay({
  element: document.getElementById('popup'),
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

// List populate
populateList();
function populateList() {
  var listDiv = document.getElementById('list');
  var sortedPeople = people.sort(function(a, b) {
    return (a.name > b.name) ? 1 : -1;
  }).
  map(function(item) {
    return '<a onClick=\"selectCityFromList(\''+item.city+'\'); return false;\" href=\"#\"><div>'+item.name+'</div></a>';
  }).
  join('<hr>');
  
  listDiv.innerHTML = sortedPeople;
}

// Global map variable
var map = new ol.Map({
  target: 'map',
  controls: [],
  overlays: [overlay],
  layers: [
    new ol.layer.Tile({
    source: new ol.source.OSM()
    }),
    new ol.layer.Vector({
      source: vectorSource
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([2.636719, 46.679594]),
    zoom: 5
  })
});

//
//  INTERACTION
//

// Get clicked featured
map.on('singleclick', function(e) {
  var feature = map.forEachFeatureAtPixel(e.pixel, function(feature) {
    return feature;
  });
  
  clearFeatures();
  
  if (!feature)
    return;
  
  activateFeature(feature);
});

// Select city when clicked from the list
function selectCityFromList(city) {
  clearFeatures();
  var feature = vectorSource.getFeatures().filter(function (item) {
    return item.getProperties().title == city;
  })[0];
  activateFeature(feature);
}

// Map cursor on hovering
map.on('pointermove', (e) => {
  const pixel = map.getEventPixel(e.originalEvent);
  const hit = map.hasFeatureAtPixel(pixel);
  document.getElementById('map').style.cursor = hit ? 'pointer' : '';
});

// Open / Close sidebar
function toggleInfo() {
  if (document.getElementById('info').style.width == document.getElementById('togglebtn').style.width) {
      
    var mq = window.matchMedia( '(only screen and (max-width: 768px))' );
    if (mq.matches) {
        document.getElementsByClassName('info')[0].style.width = 'auto';
    }
    else {
        document.getElementsByClassName('info')[0].style.width = '20%';
    }
    document.getElementsByClassName('togglebtn')[0].innerText = '‹';
  }
  else
  {
    document.getElementById('info').style.width = document.getElementById('togglebtn').style.width;
    document.getElementsByClassName('togglebtn')[0].innerText = '›';
  }
}

//
//  Generic functions
//

// Get people from clicked city
function getPeopleOnCity(feature) {
  var CityPeople = people.filter(function (item) {
    return item.city == feature.get('title');
  }).
  map(function (person) {
    return person.name; // Get names
  }).
  sort();
  
  return CityPeople;
}

// Unselect everything
function clearFeatures() {
  for (var i = 0, l = vectorSource.getFeatures().length; i < l; i++) {
    vectorSource.getFeatures()[i].setStyle(iconStyle['Default']);
  }
  overlay.setPosition(undefined);
}

// Feature selection
function activateFeature(feature) {
  // Set point style
  feature.setStyle(iconStyle['Clicked']);
  // Set popup
  var CityPeople = getPeopleOnCity(feature);
  document.getElementById('popup-content').innerHTML = '<strong>'+feature.get('title')+'</strong><hr><p>'+CityPeople.join('<br>')+'</p>'; 
  overlay.setPosition(feature.getGeometry().flatCoordinates);
  // Center on point
  var extent = map.getView().calculateExtent(map.getSize());
  if (!vectorSource.getFeaturesInExtent(extent).filter(function(e) { return e === feature; }).length > 0) {
    map.getView().setCenter(feature.getGeometry().flatCoordinates);
  }
}