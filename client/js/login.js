import axiosClient from "./axios"

export function submitForm(userName, password) {
    axiosClient.post('/user/login', {
        userName: userName,
        password: password
    })
    .then(response => {
        console.log(response.data)
        document.cookie = "id=" + response.data._id
        document.cookie = "token=" + response.data.token
        document.cookie = "role=" + response.data.role
        document.cookie = "name=" + response.data.userName
        window.location.reload()
    })
    .catch(err => {
        console.log(err)
    })
}