const {app, BrowserWindow, ipcMain} = require('electron');
const reload = require('electron-reload');
const path = require('path');
const url = require('url');
const fs = require('fs');
const moment = require('moment');

// spawn a child process...
const { spawn } = require('child_process');
const childProcesses = {};

// Type 3: Persistent datastore with automatic loading
var Datastore = require('nedb');
db = {};
db.remoteSearchistory = new Datastore({ filename: './searchremotehistory', autoload: true });
db.searchistory = new Datastore({ filename: './searchistory', autoload: true });
db.settings = new Datastore({ filename: './settings', autoload: true });

// browser directory
let home = process.env["HOME"];
let fpath = path.resolve(home, "Desktop", "fspyder-browser-tree");

// reload is only development case
reload(__dirname+'/dist');

let win;

function createWindow(){

  win = new BrowserWindow({
    width: 1200, 
    height: 600, 
    minWidth: 1000, 
    minHeight: 500,
    webPreferences: {
      nodeIntegrationInWorker: true
    }
  });

  win.setMenu(null);

  win.loadURL(url.format({
    pathname: path.resolve(__dirname, 'dist/index.html'),
    protocol: 'file',
    slashes: true
  }));

  win.webContents.openDevTools();

  win.on('close',() => {
    win = null;
  });

}

app.on('ready', function(){
  createWindow();
    
    // load data to stores...
    win.webContents.on("did-finish-load", _ => {

      // load search history
      db.searchistory.find({}, (err, docs) => {
        win.webContents.send("LOAD_SEARCH_HISTORY", docs);
      })

      // load remote search history
      db.searchistory.find({}, (err, docs) => {
        win.webContents.send("LOAD_PUBLIC_SEARCH_HISTORY", docs);
      })

      // load proxy
      db.settings.findOne({desc: "proxy"}, (err, docs) => {

        if(docs){
          win.webContents.send("LOAD_PROXY", docs);
        }else{
          console.log("no proxy settings");
        }
  
      })

      // load cred
      db.settings.findOne({desc: "cred"}, (err, docs) => {

        if(docs){
          win.webContents.send("LOAD_CRED", docs);
        }else{
          console.log("no credential settings");
        }
  
      })

      win.webContents.send("BROWSER_FILE_DIRECTORY", fpath);

    })

});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin'){
    app.quit();
  }
});

// ipc listening...

ipcMain.on('UPDATE_SEARCH', (e, m) => {

  db.searchistory.insert(m, (err, newDoc) => {
    if(err)
      throw err;
    console.log("search history updated");
  })

})

ipcMain.on('UPDATE_REMOTE_SEARCH', (e, m) => {

  db.remoteSearchistory.insert(m, (err, newDoc) => {
    if(err)
      throw err;
    console.log("search history updated");
  })

})

ipcMain.on("SAVE_PROXY", (e, dict) => {


  db.settings.findOne({desc: "proxy"}, (err, docs) => {

    if(docs){

      db.settings.update({desc: "proxy"}, dict, {}, () => {
        win.webContents.send("LOAD_PROXY", dict);        
        console.log("proxy settings are updated");
      })

    } else {

      db.settings.insert(dict, (err, newDoc) => {
        if(err)
          throw err;
        
        win.webContents.send("LOAD_PROXY", dict);
        console.log("proxy settings setted");
      })

    }

  })

})

ipcMain.on("SAVE_CREDENTIALS", (e, dict) => {

  db.settings.findOne({desc: "cred"}, (err, docs) => {

    if(docs){

      db.settings.update({desc: "cred"}, dict, {}, () => {
        win.webContents.send("LOAD_CRED", dict);        
        console.log("credentials settings are updated");
      })

    }else{

      db.settings.insert(dict, (err, newDoc) => {
        if(err)
          throw err;
        
        win.webContents.send("LOAD_CRED", dict);
        console.log("credentials settings setted");
      })

    }

  })

})

sendToRenderer = (options, message, data) => {

  if(options.socketId){
    
    // this because only fired up search starts, and that is what we want
    if(message === "INNER_LISTENER_SENDED"){
      win.webContents.send("OUTER_LISTENER_ALERT", options);
    }
    if(message === "INNER_LISTENER_SUCCESSFULLY_FINISHED"){
      win.webContents.send("OUTER_LISTENER_SUCCESSFULLY_FINISHED_ALERT", options);
    }
    if(message === "INNER_LISTENER_UNSUCCESSFULLY_FINISHED"){
      win.webContents.send("OUTER_LISTENER_UNSUCCESSFULLY_FINISHED_ALERT", options);
    }

  } else {
    win.webContents.send(message, options);
  }

}

// Start browsing multitasks...
ipcMain.on('START_BROWSING', (e, options) => {

  var child = spawn("node", ["./crawler.js"], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
  
  // notice renderer process that we spawned inside a process
  sendToRenderer(options, "INNER_LISTENER_SENDED");
  // win.webContents.send("INNER_LISTENER_SENDED", options);

  // after spawning child, then listen its sound, keep your eyes on it :D
  // I don't know if it is the right way, but right now I am doing that way
  // child sent message to parent then parent sent message to renderer.
  child.on('message', data => {

    // if username|pw is not valid...
    if(data.user_invalid){
      sendToRenderer(options, "USER_INVALID")
      // win.webContents.send("USER_INVALID");
    }
    // if proxy need ssl
    if(data.ssl_required){
      sendToRenderer(options, "SSL_REQUIRED")
      // win.webContents.send("SSL_REQUIRED");
    }
    // no internet connection
    if(data.no_internet){
      sendToRenderer(options, "NO_INTERNET")
      // win.webContents.send("NO_INTERNET");
    }
    // not resolved
    if(data.not_resolved){
      sendToRenderer(options, "NOT_RESOLVED")
      // win.webContents.send("NO_INTERNET");
    }
    // proxy failed
    if(data.proxy_failed){
      sendToRenderer(options, "PROXY_FAILED")
      // win.webContents.send("PROXY_FAILED");
    }
    // proxy timed out
    if(data.timed_out){
      sendToRenderer(options, "PROXY_TIME_OUT")
      // win.webContents.send("PROXY_TIME_OUT");
    }
    // no credentials
    if(data.no_credentials){
      sendToRenderer(options, "NO_CREDS")
      // win.webContents.send("NO_CREDS");
    }
    // no credentials
    if(data.empty_page){
      sendToRenderer(options, "EMPTY_PAGE")
      // win.webContents.send("NO_CREDS");
    }
    // no credentials
    if(data.no_support_proxy){
      sendToRenderer(options, "NO_SUPPORT_PROXY")
      // win.webContents.send("NO_SUPPORT_PROXY");
    }
    // success
    if(data.successfully){
      sendToRenderer(options, "INNER_LISTENER_SUCCESSFULLY_FINISHED")
      // win.webContents.send("INNER_LISTENER_SUCCESSFULLY_FINISHED");
    }
    // unsuccessfull usually covers all pitfalls
    if(data.unsuccessfully){
      sendToRenderer(options, "INNER_LISTENER_UNSUCCESSFULLY_FINISHED")
      // win.webContents.send("INNER_LISTENER_UNSUCCESSFULLY_FINISHED");
    }

    if(data.page){
      if(data.socket){
        win.webContents.send("PRIVATE_CONTENT", data);
      }else{
        win.webContents.send("LOCAL_CONTENT", data);
      }
    }

  })


  childProcesses.start = () => {
    console.log("search started");
    child.send(options);
  };
  childProcesses.start();


})

create_the_folder = name => {
  console.log("amına koyayım");
  if (!fs.existsSync(name)){
    fs.mkdir(name);
  }
}

ipcMain.on("WRITE_FILES", (e, options) => {

  // lat folder name is date
  let date = moment().format("DD-MM-YY-hh");

  let p1 = null;
  // create folder name fspyder-browser-tree
  if(fs.existsSync(fpath)){
    p1 = fpath
  }else{
    fs.mkdir(fpath)
    p1 = fpath
  }

  let p2 = path.resolve(p1, date)

  // create folders inside browser-tree
  if(fs.existsSync(p2)){
    p1 = p2
  }else{
    fs.mkdir(p2)
    p1 = p2
  }

  // fill that folder
  let lastpath = path.resolve(p1, String(options.filename)+".html");
  let buff = new Buffer(options.contents)
  fs.writeFile(lastpath, buff, err => {
    console.log(err);
  })


});