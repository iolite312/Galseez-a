import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { sendMarker } from './socket';
import { getCookie } from './cookie';

let map;
let markers = [];

export function initializeMap() {
  map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    createMarker(lat, lng);
    sendMarker([lat, lng])
  });
}

export function createMarker(data) {
  if (data[2].visible == 0 && data[3]._id != getCookie('id')) return
  const marker = L.marker([data[0], data[1]]);
  marker.addTo(map);

  const popupContent = `
    <div>
      <p style="display:none;">${data[4]}</p>
      Name: ${data[2].name}<br>
      State: ${data[2].friendOrFoe} <br>
      Latitude: ${data[0]}<br>
      Longitude: ${data[1]}<br>
      <button class="remove-marker">Remove</button>
      <button class="save">Save</button>
    </div>
  `;
  switch (data[2].object) {
    case 0:
      var icon = L.icon({
        iconUrl: 'ship.svg',
        iconSize: [32, 32], // Adjust the size of the icon as needed
      });
      marker.setIcon(icon)
      break;
    case 1:
      var icon = L.icon({
        iconUrl: 'turbine.svg',
        iconSize: [32, 32], // Adjust the size of the icon as needed
      });
      marker.setIcon(icon)
      break;
    case 2:
      var icon = L.icon({
        iconUrl: 'oilrig.svg',
        iconSize: [32, 32], // Adjust the size of the icon as needed
      });
      marker.setIcon(icon)
      break;
    default:
      break;
  }

  marker.bindPopup(popupContent);
  marker.on('popupopen', () => {
    const removeButton = document.querySelector('.remove-marker');
    const saveButton = document.querySelector('.save');
    removeButton.addEventListener('click', () => {
      removeMarker(marker);
      // console.log(markers)
    });
    saveButton.addEventListener('click', () => {
      sendMarker([data[0], data[1]])
    })
  });
  markers.push(marker);
}

export function removeMarker(marker) {
  marker.remove();
  markers = markers.filter((m) => m !== marker);
}

export function getMarkers() {
  return markers;
}
