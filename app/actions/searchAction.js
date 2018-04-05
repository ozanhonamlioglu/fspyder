const { ipcRenderer } = require("electron");

let updatesearch = dict => {
    return ipcRenderer.send("UPDATE_SEARCH", dict);
}

let updateRemoteSearch = dict => {
    return ipcRenderer.send("UPDATE_REMOTE_SEARCH", dict);
}

export function sendSearch(entry) {
    let remote_only_entry;
    return {
        type: "SEARCH_HISTORY",
        payload: new Promise((resolve, reject) => {
            let only_entry = {search: entry.search, date: entry.date}
            if(entry.socketId){
                remote_only_entry = {...only_entry, socketId: entry.socketId}
                resolve(
                    updateRemoteSearch(only_entry)
                )
            }else{
                resolve(
                    updatesearch(only_entry)
                )
            }

        })
        .then(_ => {
            ipcRenderer.send( 'START_BROWSING', {...entry} );
            return entry;
        })
        .catch(e => {
            throw e;
        })
    }

}

export function loadHistory(dict) {
    return {
        type: "LOAD_HISTORY",
        payload: dict
    }
}

export function loadPublicHistory(dict) {
    return {
        type: "LOAD_PUBLIC_HISTORY",
        payload: dict
    }
}