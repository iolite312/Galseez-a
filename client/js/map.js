import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { destroyMarker, saveMarker, updateMarker } from './socket';
import { getCookie } from './cookie';
import axiosClient from './axios';

let map;
let markers = [];
let clickable = 0;
let moving;

export function initializeMap() {
  map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    if (clickable == 1) {
      localMarker([lat, lng]);
    }
  });
}
export function click() {
  clickable = 1
}

export function createMarker(data) {
  if (data[2].visible == 0 && data[3]._id != getCookie('id')) return;
  const marker = L.marker([data[0], data[1]]);
  marker.addTo(map);

  const popupContent = `
    <div>
      <p id='markerID' style="display:none;">${data[4]}</p>
      Name: <span id='markerName'>${data[2].name}</span><br>
      State: <select class="state"><option value="Ally">Ally</option><option value="Unknown">Unknown</option><option value="Enemy">Enemy</option></select><br>
      Object: <select class="object"><option value="0">Ship</option><option value="1">Windmill</option><option value="2">Oilrig</option></select><br>
      Visible to others: <select class="visibility"><option value="1">Yes</option><option value="0">No</option></select><br>
      Latitude: <span class="latitude">${data[0]}</span><br>
      Longitude: <span class="longitude">${data[1]}</span><br>
      Strike Order: <span id='orderStrike' style='margin: 0;' value=''></span><br>
      Created by: ${data[3].userName}<br>
      <button class="remove-marker">Remove</button>
      <button class="move">Move</button>
      <button class="update">Update</button>
      <button class="orderStrike">Order Strike</button>
    </div>
  `;

  switch (data[2].object) {
    case 0:
      var icon = L.icon({
        iconUrl: `ship${data[2].friendOrFoe}.svg`,
        iconSize: [32, 32], // Adjust the size of the icon as needed
      });
      marker.setIcon(icon);
      break;
    case 1:
      var icon = L.icon({
        iconUrl: `turbine${data[2].friendOrFoe}.svg`,
        iconSize: [48, 48], // Adjust the size of the icon as needed
      });
      marker.setIcon(icon);
      break;
    case 2:
      var icon = L.icon({
        iconUrl: `oilrig${data[2].friendOrFoe}.svg`,
        iconSize: [32, 32], // Adjust the size of the icon as needed
      });
      marker.setIcon(icon);
      break;
    default:
      break;
  }

  const popup = L.popup().setContent(popupContent);
  marker.bindPopup(popup);
  marker.on('popupopen', () => {
    const removeButton = popup.getElement().querySelector('.remove-marker');
    const updateButton = popup.getElement().querySelector('.update');
    const moveButton = popup.getElement().querySelector('.move');
    const strikeButton = popup.getElement().querySelector('.orderStrike');
    const latitudeSpan = popup.getElement().querySelector('.latitude');
    const longitudeSpan = popup.getElement().querySelector('.longitude');
    const stateSelect = popup.getElement().querySelector('.state');
    const objectSelect = popup.getElement().querySelector('.object');
    const visibilitySelect = popup.getElement().querySelector('.visibility');
    const orderStrike = popup.getElement().querySelector('#orderStrike');

    if (data[5]) {
      if (data[5]._id == getCookie('id') && data[3]._id != getCookie('id')) {
        removeButton.disabled = false;
        console.log('not blocked yes data[5] check 5');
      } else if (data[5]._id != getCookie('id') && data[3]._id == getCookie('id')) {
        removeButton.disabled = false;
        console.log('not blocked yes data[5] check 3');
      } else {
        removeButton.disabled = true;
        console.log('blocked yes data[5] check 3');
      }
    } else if (data[3]._id == getCookie('id')) {
      removeButton.disabled = false;
      console.log('not blocked no data[5]');
    } else {
      removeButton.disabled = true;
      console.log('blocked no data[5]');
    }
    
    if (data[3]._id != getCookie('id')) {
      strikeButton.disabled = true
    } else {
      strikeButton.disabled = false
    }
    if (data[3]._id != getCookie('id')) {
      moveButton.disabled = true
    } else {
      moveButton.disabled = false
    }
    if (data[3]._id != getCookie('id')) {
      updateButton.disabled = true
    } else {
      updateButton.disabled = false
    }

    if (data[5]) {
      orderStrike.value = data[5]._id
      orderStrike.textContent = data[5].userName
    }

    removeButton.addEventListener('click', () => {
      destroyMarker(data[4]);
    });

    moveButton.addEventListener('click', () => {
      if (marker.dragging.enabled()) {
        marker.dragging.disable();
        moveButton.innerHTML = 'Move';
        console.log('?');
      } else {
        marker.dragging.enable();
        moveButton.innerHTML = 'Stop moving';
      }
    });
    strikeButton.addEventListener('click', () => {
      axiosClient.post('/user/all')
        .then((response) => {
          const mount = document.querySelector('#popupUser');
          const data = response.data;

          data.forEach(element => {
            let user = document.createElement('div');
            user.classList.add('flexy');
            let p = document.createElement('p');
            p.setAttribute('value', element._id);
            p.textContent = element.userName;
            let setbutton = document.createElement('button');
            setbutton.textContent = 'select';
            setbutton.addEventListener('click', () => {
              orderStrike.value = element._id
              orderStrike.textContent = element.userName
              mount.classList.remove('open')
              while (mount.firstChild) {
                mount.firstChild.remove();
              }
            });
            if (element._id !== getCookie('id')) {
              user.appendChild(p);
              user.appendChild(setbutton);
              mount.appendChild(user);
            }
          });
          let buttonCluster = document.createElement('div')
          buttonCluster.classList.add('flex')
          let button = document.createElement('button');
          button.textContent = 'Close';
          button.addEventListener('click', () => {
            mount.classList.remove('open')
            while (mount.firstChild) {
              mount.firstChild.remove();
            }
          })
          let button2 = document.createElement('button')
          button2.textContent = 'Clear order strike'
          button2.addEventListener('click', () => {
            mount.classList.remove('open')
            while (mount.firstChild) {
              mount.firstChild.remove();
            }
            orderStrike.value = ''
            orderStrike.textContent = ''
          })
          buttonCluster.appendChild(button2);
          buttonCluster.appendChild(button);
          mount.appendChild(buttonCluster)
          mount.classList.add('open');
        })
        .catch((err) => {
          console.log(err);
        });
    });


    updateButton.addEventListener('click', () => {
      const markerID = popup.getElement().querySelector('#markerID');
      const latitudeSpan = popup.getElement().querySelector('.latitude');
      const longitudeSpan = popup.getElement().querySelector('.longitude');
      const name = popup.getElement().querySelector('#markerName')
      const stateSelect = popup.getElement().querySelector('.state').value;
      const objectSelect = popup.getElement().querySelector('.object').value;
      const visibilitySelect = popup.getElement().querySelector('.visibility').value;
      const orderStrike = popup.getElement().querySelector('#orderStrike').value;

      const compiledData = [markerID.textContent, latitudeSpan.textContent, longitudeSpan.textContent, name.textContent, stateSelect, parseInt(objectSelect), parseInt(visibilitySelect), orderStrike]
      if (!compiledData[6] && data[2].visible) return alert('Je kan hem niet terug zetten');
      updateMarker(compiledData)
    });

    marker.on('drag', (e) => {
      const { lat, lng } = e.latlng;
      data[0] = lat;
      data[1] = lng;
      latitudeSpan.textContent = lat;
      longitudeSpan.textContent = lng;
    });

    // Update the move button text based on the moveable state of the marker
    if (marker.dragging.enabled()) {
      moveButton.innerHTML = 'Stop moving';
    } else {
      moveButton.innerHTML = 'Move';
    }

    // Set the selected options in the select tags based on the data values
    stateSelect.value = data[2].friendOrFoe;
    objectSelect.value = data[2].object.toString();
    visibilitySelect.value = data[2].visible.toString();

    // Update the popup content with the new position
    latitudeSpan.textContent = data[0];
    longitudeSpan.textContent = data[1];
  });

  markers.push(marker);
}

export function localMarker(data) {
  const marker = L.marker([data[0], data[1]]);
  marker.addTo(map);
  const popupContent = `
    <div>
      <p style="display:none;" id='userID'>${getCookie('id')}</p>
      Name: <input type="text" name='markerName' id='markerName' placeholder="Enter marker name here" ><br>
      State: <select id='state'><option value="Ally">Ally</option><option value="Unknown">Unknown</option><option value="Enemy">Enemy</option></select><br>
      Object: <select id='object'><option value="0">Ship</option><option value="1">Windmill</option><option value="2">Oilrig</option></select><br>
      Visible to others: <select id='visibility'><option value="1">Yes</option><option value="0">No</option></select><br>
      Created By: <span>${getCookie('name')}</span><br>
      Latitude: <span id="latitude">${data[0]}</span><br>
      Longitude: <span id="longitude">${data[1]}</span><br>
      <button class="remove-marker">Remove</button>
      <button class="move">Move</button>
      <button class="save">Save</button>
    </div>
  `;

  marker.bindPopup(popupContent);
  marker.on('popupopen', () => {
    const removeButton = document.querySelector('.remove-marker');
    const saveButton = document.querySelector('.save');
    const moveButton = document.querySelector('.move');
    const latitudeSpan = document.getElementById('latitude');
    const longitudeSpan = document.getElementById('longitude');
    const userID = document.getElementById('userID');
    const name = document.getElementById('markerName');

    removeButton.addEventListener('click', () => {
      removeMarker(marker);
      console.log('crap pants');
    });

    moveButton.addEventListener('click', () => {
      if (moving == 1) {
        marker.dragging.disable();
        moveButton.innerHTML = 'Move';
        moving = 0;
      } else {
        marker.dragging.enable();
        moveButton.innerHTML = 'Stop moving';
        moving = 1;
      }
    });

    saveButton.addEventListener('click', () => {
      const state = document.getElementById('state').value;
      const object = document.getElementById('object').value;
      const visibility = document.getElementById('visibility').value;
      const compiledData = [latitudeSpan.textContent, longitudeSpan.textContent, name.value, state, parseInt(object), parseInt(visibility), userID.textContent];
      saveMarker(compiledData);
    });

    marker.on('drag', (e) => {
      const { lat, lng } = e.latlng;
      data[0] = lat;
      data[1] = lng;
      latitudeSpan.textContent = lat;
      longitudeSpan.textContent = lng;
    });
  });

  markers.push(marker);
  clickable = 0;
}



export function removeMarker(marker) {
  marker.remove();
  markers = markers.filter((m) => m !== marker);
}

export function getMarkers() {
  return markers;
}
export function clearMarkers() {
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
}
