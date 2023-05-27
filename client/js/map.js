import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  });
}

export function createMarker(lat, lng) {
  const marker = L.marker([lat, lng]);
  marker.addTo(map);

  const popupContent = `
    <div>
      Latitude: ${lat}<br>
      Longitude: ${lng}<br>
      <button class="remove-marker">Remove</button>
    </div>
  `;

  marker.bindPopup(popupContent);
  marker.on('popupopen', () => {
    const removeButton = document.querySelector('.remove-marker');
    removeButton.addEventListener('click', () => {
      removeMarker(marker);
    });
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
