import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export function setupMap() {
  // initialize the map on the "map" div with a given center and zoom
const map = L.map('map', { doubleClickZoom: false }).locate({ setView: true, maxZoom: 19 });

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

function onLocationFound(e) {
  var radius = e.accuracy / 4;

  L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
  map.setView([51.505, -0.09], 13);
}

map.on("locationfound", onLocationFound);
map.on("locationerror", onLocationError);

var localMarker; // global variable
var markers; // global variable

function onClick(e) {
  alert(this.getLatLng());
}

function onMapClick(e) {
  var position = [e.latlng.lat, e.latlng.lng];
  var thisIcon = new L.Icon({
    iconUrl: 'chart.png',
    iconAnchor: new L.Point(16, 16),
  });
  var options = {
    alt: 'test',
    icon: thisIcon
  };
  if (localMarker) {
    localMarker.remove();
  }
  localMarker = new L.marker(position, options).addTo(map);
  console.log(localMarker);
}

var array = [
  {
    lat: 51.6,
    lng: -0.29,
    options: [
      { alt: 'Test', check: true }
    ]
  },
  {
    lat: 51.7,
    lng: -0.19,
    options: [
      { alt: 'Test', check: true }
    ]
  },
  {
    lat: 51.2,
    lng: -0.49,
    options: [
      { alt: 'Test', check: true }
    ]
  },
  {
    lat: 51.1,
    lng: -0.69,
    options: [
      { alt: 'Test', check: true }
    ]
  }
];
renderMarkers(array);

function renderMarkers(tests) {
  tests.forEach(item => {
    var id = Math.random();
    var position = [item.lat, item.lng];
    var thisIcon = new L.Icon({
      iconUrl: 'chart2.png',
      iconAnchor: new L.Point(16, 16),
    });
    var options = {
      icon: thisIcon
    };
    markers = new L.marker(position, options).addTo(map).on('click', function () { getData(id) });
  });
}

function getData(id) {
  console.log(id);
}


map.on('click', onMapClick);
}
