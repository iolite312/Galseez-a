import axiosClient from "./axios"

export function submitForm(userName, password) {
    axiosClient.post('/user/login', {
        userName: userName,
        password: password
    })
    .then(res => {
        console.log(res)
        document.cookie = "id=" + res.data._id
        document.cookie = "token=" + res.data.token
        document.cookie = "role=" + res.data.role
        document.cookie = "name=" + res.data.userName
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