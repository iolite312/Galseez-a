import './style.scss'
import { initializeMap } from './js/map';
import { getCookie } from './js/cookie';

const tokenCookie = getCookie('token')

if (!tokenCookie) {
    document.querySelector('#app').innerHTML = `
        <div>
            <label for="userName">Gebruikersnaam:</label>
            <input name='userName' type="text" id="userName">
            <label for="password">Wachtwoord:</label>
            <input name='password' type="text">
            <button onclick="submitForm()">Inloggen</button>
        </div>
    `
} else {
    document.querySelector('#app').innerHTML = `
    <div id="map" style="height: 100vh; width: 100vw;"></div>`
    initializeMap()
}
