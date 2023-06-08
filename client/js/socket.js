import { io } from "socket.io-client";
import { clearMarkers, createMarker } from "./map";
const socket = io('ws://localhost:3000')
socket.on("connect", () => {
    console.log(socket.connected); // true
});
export function saveMarker(data) {
    socket.emit('createMarker', data)
}
socket.on('createMarker', (data) => {
    if (data == 0) return alert('Marker failed')
    if (data == 2) return alert('Marker failed')
    socket.emit('allMarkers')
    alert('Marker Created')
})
export function updateMarker(data) {
    socket.emit('updateMarker', data)
}
socket.on('updateMarker', (data) => {
    if (data == 0) return alert('Marker failed')
    if (data == 2) return alert('Marker failed')
    socket.emit('allMarkers')
    alert('Marker Updated')
})
socket.on('allMarkers', (data) => {
    clearMarkers()
    data.forEach(e => {
        createMarker([e.lat, e.lng, e.object[0], e.user, e._id, e.orderStrike])
    });
})
export function destroyMarker(id) {
    socket.emit('deleteMarker', id)
}
socket.on('RdeleteMarker', (data) => {
    if (data == 1) {
        alert('Marker deletion succesful')
        recreateMarker()
    } else {
        alert('Something went wrong')
    }
})
function recreateMarker() {
    clearMarkers()
    socket.emit('allMarkers', (data) => {
        data.forEach(e => {
            createMarker([e.lat, e.lng, e.object[0], e.user, e._id, e.orderStrike])
        });
    })
}
