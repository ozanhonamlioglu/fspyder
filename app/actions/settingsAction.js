const { ipcRenderer } = require("electron");

let updateproxy = dict => {
    return ipcRenderer.send("SAVE_PROXY", dict);
}

let updatecred = dict => {
    return ipcRenderer.send("SAVE_CREDENTIALS", dict);
}

export function loadProxy(settings){

    return {
        type: "LOAD_PROXY",
        payload: settings
    }

}

export function loadCredentials(settings){

    return {
        type: "LOAD_CRED",
        payload: settings
    }

}

export function setProxy(settings){

    return {
        type: "SAVE_PROXY",
        payload: new Promise((resolve, reject) => {
            resolve(
                updateproxy(settings)
            )
        })
        .then(
            console.log("proxy updated", settings)
        )
        .catch(e => console.log(e))
    }

}

export function setCredentials(settings) {

    return {
        type: "SAVE_CREDENTIALS",
        payload: new Promise((resolve, reject) => {
            resolve(
                updatecred(settings)
            )
        })
        .then(
            console.log("credentials updated", settings)
        )
        .catch(e => console.log(e))
    }

}