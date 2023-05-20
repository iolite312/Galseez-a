import './style.scss'
import { setupMap } from './js/map'
import { getCookie } from './js/cookie'

const tokenCookie = getCookie('token')

if (!tokenCookie) {
    document.querySelector('#app').innerHTML = `
        no cookie
    `
} else {
    document.querySelector('#app').innerHTML = `
    <div id="map" style="height: 100vh; width: 100vw;"></div>`
    setupMap()
}
