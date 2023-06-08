// import 'dotenv/config'
import './style.scss'
import { click, initializeMap } from './js/map';
import { getCookie } from './js/cookie';
import { submitForm, validateUser } from './js/login';

const tokenCookie = getCookie('token')

if (!tokenCookie) {
    document.querySelector('#app').innerHTML = `
        <div>
            <label for="userName">Gebruikersnaam:</label>
            <input name='userName' type="text" id="userName">
            <label for="password">Wachtwoord:</label>
            <input name='password' type="text" id="password">
            <button id="submitform">Inloggen</button>
        </div>
    `
    document.addEventListener('DOMContentLoaded', () => {
        const loginButton = document.getElementById('submitform');
        const userName = document.getElementById('userName');
        const password = document.getElementById('password');
    
        loginButton.addEventListener('click', () => {
            submitForm(userName.value, password.value);
        });
    });
    if (sessionStorage.getItem("Unauthorized")) {
        alert('Unauthorized')
        sessionStorage.removeItem("Unauthorized")
    }
} else {
    document.querySelector('#app').innerHTML = `
    <button id='placeMarker'>Place Marker</button>
    <div id='popupUser'></div>
    initializeMap()
    validateUser(getCookie('id'), getCookie('token'))
    document.addEventListener('DOMContentLoaded', () => {
        const placeMarker = document.getElementById('placeMarker');
        placeMarker.addEventListener('click', () => {
            click();
        });
    });
}
