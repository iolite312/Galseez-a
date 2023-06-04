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
export function validateUser(id, token) {
    axiosClient.post('/user/validate', {
        id: id,
        token: token
    }, { withCredentials: true })
    .then(res => {
        if (res.status !== 200) return alert('Unauhtorized')
    })
    .catch(err => {
        console.log(err)
        sessionStorage.setItem('Unauthorized', true)
        window.location.reload()
    }) 
}