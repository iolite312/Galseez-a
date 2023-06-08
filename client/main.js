import './style.scss'
import { click, initializeMap } from './js/map';
import { getCookie } from './js/cookie';
import { submitForm, validateUser } from './js/login';
import axiosClient from './js/axios';

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
    <div style='display:flex; margin: 10px;'>
        <div style='flex-grow: 1;' id='adminMount'>
            <button id='placeMarker'>Place Marker</button>
        </div>
        <div style='display: flex;'>
            <p style='margin-right: 10px'>Logged in as: ${getCookie('name')}</p>
            <button id='logout'>log out</button>
        </div>
    </div>
    <div id="map" style="height: 95.8vh; width: 100vw; z-index:0;"></div>
    <div id='popupUser'></div>
    <div id='popupAdmin'></div>`
  initializeMap()
  validateUser(getCookie('id'), getCookie('token'))
  document.addEventListener('DOMContentLoaded', () => {
    const placeMarker = document.getElementById('placeMarker');
    placeMarker.addEventListener('click', () => {
      click();
    });
  });
  const logout = document.querySelector('#logout')
  logout.addEventListener('click', () => {
    document.cookie = "id="
    document.cookie = "token="
    document.cookie = "role="
    document.cookie = "name="
    window.location.reload()
  })
  if (getCookie('role') == 'admin') {
    const adminMount = document.querySelector('#adminMount')
    let createUser = document.createElement('button')
    createUser.textContent = 'Create user'
    createUser.addEventListener('click', () => {
      axiosClient.post('/user/all')
        .then((response) => {
          const mount = document.querySelector('#popupAdmin');
          const data = response.data;

          data.forEach(element => {
            let user = document.createElement('div');
            user.classList.add('flexy');
            let p = document.createElement('p');
            p.setAttribute('value', element._id);
            p.textContent = element.userName;
            let setbutton = document.createElement('button');
            setbutton.textContent = 'Remove';
            setbutton.addEventListener('click', () => {
              axiosClient.post('/user/delete', {
                _id: element._id
              })
              .then((response2) => {
                if (response2.status == 200) {
                  window.location.reload()
                  return alert('User Deleted')
                } 

              })
              .catch((err) => {
                console.log(err)
              })
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
          let inputCluster = document.createElement('div')
          inputCluster.classList.add('input-flex')
          let passwordInput = document.createElement('input')
          passwordInput.setAttribute('type', 'password')
          passwordInput.setAttribute('placeholder', 'password here')
          passwordInput.classList.add('password')
          let userNameInput = document.createElement('input')
          userNameInput.setAttribute('type', 'text')
          userNameInput.setAttribute('placeholder', 'username here')
          userNameInput.classList.add('userName')
          inputCluster.appendChild(userNameInput)
          inputCluster.appendChild(passwordInput)
          let button2 = document.createElement('button')
          button2.textContent = 'Create user'
          button2.addEventListener('click', () => {
            const userName = document.querySelector('.userName').value;
            const password = document.querySelector('.password').value;
            console.log(userName, password)
            axiosClient.post('/user/create', {
              userName: userName,
              password: password
            })
            .then((response2) => {
              if (response2.status == 201) return alert('User Created')
            })
            .catch((err) => {
              console.log(err)
            })
          })
          inputCluster.appendChild(button2)
          buttonCluster.appendChild(inputCluster);
          buttonCluster.appendChild(button);
          mount.appendChild(buttonCluster)
          mount.classList.add('open');
        })
        .catch((err) => {
          console.log(err);
        });
    })
    adminMount.appendChild(createUser)
  } else {
    console.log('user')
  }
}
