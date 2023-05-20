export function getCookie(cName) {
    const name = cName + '='
    const cDecoded = decodeURIComponent(document.cookie)
    const cArray = cDecoded.split('; ')
    let res = ''
    cArray.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res
}