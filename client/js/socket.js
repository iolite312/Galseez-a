import { io } from "socket.io-client";
import { createMarker } from "./map";
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
    data.forEach(e => {
        // console.log(e.user)
        createMarker([e.lat, e.lng, e.object[0], e.user, e._id])
    });
})
