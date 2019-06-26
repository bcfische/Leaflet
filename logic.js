// API endpoint
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform GET request to the query URL
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + "Magnitude: " + feature.properties.mag + " (" + getCategory(feature.properties.mag) + ")"
      + "<br>" + feature.properties.place
      + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .75,
        color: "black",
        weight: 1
      })
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define lightmap layer
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create our map, giving it the lightmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [39.53, -117.82],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });

  // Create legend for circle marker colors
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 2, 4, 5, 6, 7, 8],   
      labels = [];
    for (var i=0; i<grades.length; i++) {
      div.innerHTML += '<i style="background:' + getColor(grades[i]) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
}

// Function to determine category of earthquake, based on magnitude
function getCategory(mag) {
  if (mag>=8.0) return "Great";
  else if (mag>=7.0) return "Major";
  else if (mag>=6.0) return "Strong";
  else if (mag>=5.0) return "Moderate";
  else if (mag>=4.0) return "Light";
  else if (mag>=2.0) return "Minor";
  else return "Micro";
}
// Function to determine circle color, based on magnitude
function getColor(mag) {
  if (mag>=8.0) return "Red";
  else if (mag>=7.0) return "Orange";
  else if (mag>=6.0) return "Yellow";
  else if (mag>=5.0) return "Green";
  else if (mag>=4.0) return "Blue";
  else if (mag>=2.0) return "Indigo";
  else return "Violet";
}
// Function to determine circle radius, based on magnitude
function getRadius(mag) {
  return 15000*mag;
}
