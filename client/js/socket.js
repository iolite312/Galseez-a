import { io } from "socket.io-client";
import { clearMarkers, createMarker } from "./map";
const socket = io('ws://localhost:3000')
socket.on("connect", () => {
    console.log(socket.connected); // true
});
export function sendMarker(markers) {
    socket.emit('sendMarker', markers)
}
socket.on('placeMarker', (arg) => {
    createMarker([arg[0], arg[1]])
})
socket.on('allMarkers', (data) => {
    clearMarkers()
    data.forEach(e => {
        // console.log(e.user)
        createMarker([e.lat, e.lng, e.object[0], e.user, e._id])
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
        console.log('socket')
        data.forEach(e => {
            // console.log(e.user)
            createMarker([e.lat, e.lng, e.object[0], e.user, e._id])
        });
    })
}
