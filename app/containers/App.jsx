import React, { Component } from 'react'
import { connect } from "react-redux";

// Renderer process
import { ipcRenderer } from "electron";

// socket-io
import io from "socket.io-client";
const SOCKLINK = "http://localhost:3132";

// Styles...
import "../static/kernel.min.css";
import "../static/fonts/roboto.css";
import "../static/fonts/presstart.css";
import "../static/style.less";
import "../static/kernel.js";
import $ from 'jquery';

// loader as props
import loader from "../static/loader.gif";

// Actions...
import { sendSearch, loadHistory, loadPublicHistory } from "../actions/searchAction";
import { updatePageHistory } from "../actions/pageHistory";
import { loadProxy, setProxy, setCredentials, loadCredentials } from "../actions/settingsAction";

// Components...
import Frame from "../components/Frame.jsx";

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            socket: null,
            connected_users: 0,
            connection: true,
            max_remote_process: 10,
            mine_activations: {sended: 0, finished: 0, dead: 0, lost: 0},
            remote_activations: {received: 0, finished: 0, dead: 0},
            query: "",
            pages: [],
            mypage: "",
            dir: null
        }
    }

    componentWillMount(){
        // set socket
        const socket = io(SOCKLINK, {reconnection: true});
        this.setState({socket})
    }

    componentDidMount(){

        this.initSocket();

        // initalize search history database and insert it into redux states
        ipcRenderer.on("LOAD_SEARCH_HISTORY", (event, docs) => {
            docs.map(data => {
                this.props.firstLoad(data)
            })
        })

        // initalize search history database and insert it into redux states
        ipcRenderer.on("LOAD_PUBLIC_SEARCH_HISTORY", (event, docs) => {
            docs.map(data => {
                this.props.firstPublicLoad(data)
            })
        })


        ipcRenderer.on("BROWSER_FILE_DIRECTORY", (event, path) => {
            this.setState({dir: path})
        })

        // update PROXY_SETTINGS
        ipcRenderer.on("LOAD_PROXY", (event, docs) => {
            this.props.fireProxy(docs);
        })

        // update CRED_SETTINGS
        ipcRenderer.on("LOAD_CRED", (event, docs) => {
            this.props.fireCred(docs);
        })

        ipcRenderer.on("USER_INVALID", _ => {
            this.error_notification("<p>Upps! User credentials are invalid or</p> <p>Typing could be fast, Try again!</p>", 7000);
        })

        ipcRenderer.on("EMPTY_PAGE", _ => {
            this.error_notification("Search returned empty, no query matched", 5000);
        })

        ipcRenderer.on("NO_INTERNET", _ => {
            this.error_notification("No internet connection!", 3000);
        })

        ipcRenderer.on("NOT_RESOLVED", _ => {
            this.error_notification("Host name could not resolved!", 3000);
        })

        ipcRenderer.on("SSL_REQUIRED", _ => {
            this.error_notification("Your proxy needs to support SSL, try new one.", 3000);
        })

        ipcRenderer.on("NO_SUPPORT_PROXY", _ => {
            this.error_notification("Invalid proxy settings are detected.", 3000);
        })

        ipcRenderer.on("PROXY_FAILED", _ => {
            this.error_notification("Can't connect to Proxy.", 3000);
        })

        ipcRenderer.on("PROXY_TIME_OUT", _ => {
            this.error_notification("Proxy connection is timed out", 3000);
        })

        ipcRenderer.on("NO_CREDS", _ => {
            this.error_notification("No any user credentials found, please update yours.", 3000);
        })

        this.mine_monitoring();

    }

    error_notification = (msg, timer) => {
        $(".message-container p").html(msg);
        let width = $("#page-error").width();
        $("#page-error").css("left", -width);
        $("#page-error").animate({
            "left": 10
        }, 200, function(){
            setTimeout(() => {
                
                $("#page-error").animate({
                    "left": -width + 20
                }, 200, function(){
                    $("#page-error").css("left", "-200000px");
                })

            }, timer);
        })
    }

    grab_pages = socket => {

        // local listener
        ipcRenderer.on("LOCAL_CONTENT", (event, docs) => {
            // this.setState({
            //     mypage: docs
            // })
            ipcRenderer.send("WRITE_FILES", docs)
        })

        // local listener
        ipcRenderer.on("PRIVATE_CONTENT", (event, docs) => {
            // this.setState({
            //     mypage: docs
            // })
            socket.emit("PRIVATE_CONTENT_DELIVER", docs);
        })

        socket.on("PRIVATE_CONTENT_DELIVER", docs => {
            ipcRenderer.send("WRITE_FILES", docs)
        })

    }

    initSocket = _ => {

        const {socket} = this.state

        if(socket){

            socket.on("connect", _ => {
                console.log("connected.", socket.id);
                this.setState({connection: true})
                socket.emit("USER_CONNECTED", this.connectedUsers)
            })

            socket.on("connect_failed", _ => {
                console.log("connection failed!")
            })

            socket.on("connect_error", _ => {
                console.log("server is offline")
                this.setState({connection: false})
            })

            socket.on("SEND_COUNTED_USERS", count => {
                console.log("broadcast ",count)
                this.setState({connected_users: count})
            })

            // listen from server to update informations
            socket.on("OUTER_LISTENER_STARTED", _ => {
                this.setState({
                    mine_activations: {...this.state.mine_activations, sended: this.state.mine_activations.sended + 1, lost: this.state.mine_activations.lost + 1}
                })
            })
            socket.on("OUTER_LISTENER_UNSUCCESSFULLY_FINISHED", _ => {
                this.setState({
                    mine_activations: {...this.state.mine_activations, dead: this.state.mine_activations.dead + 1, lost: this.state.mine_activations.lost - 1}
                })
            })
            socket.on("OUTER_LISTENER_SUCCESSFULLY_FINISHED", _ => {
                this.setState({
                    mine_activations: {...this.state.mine_activations, finished: this.state.mine_activations.finished + 1, lost: this.state.mine_activations.lost - 1}
                })
            })

            // inner listener located HEADER and HERE for send search activity to other nodes
            ipcRenderer.on("INNER_LISTENER_SENDED", (e, options) => {
                let spy = {
                    search: options.search,
                    socketId: socket.id,
                    date: options.date
                }
                socket.emit("DATA_TO_NODE", spy)
                this.setState({query: options.search})
            })

            // initialize spy listener
            this.spy_listener(socket);
            this.remote_trace(socket);
            this.grab_pages(socket);

        } else {
            console.log("no socket");
        }

    }

    spy_listener = socket => {

        socket.on("START_SPYING", data => {
            const {max_remote_process} = this.state
            // add credentials and proxy settings right here, so it is impossible to accessible outside.
            if(max_remote_process > 0 ){

                this.setState({
                    max_remote_process: this.state.max_remote_process - 1
                })

                const { credentials, proxy } = this.props.settingState
                data.credentials = credentials
                data.proxy = proxy
                this.props.search(data)

            }

        })

    }

    mine_monitoring = _ => {

        // here are bunch of listeners for inner listener to show some log
        ipcRenderer.on("INNER_LISTENER_SENDED", (e, options) => {
            this.setState({
                mine_activations: {...this.state.mine_activations, sended: this.state.mine_activations.sended + 1, lost: this.state.mine_activations.lost + 1}
            })
        })

        ipcRenderer.on("INNER_LISTENER_SUCCESSFULLY_FINISHED", _ => {
            this.setState({
                mine_activations: {...this.state.mine_activations, finished: this.state.mine_activations.finished + 1, lost: this.state.mine_activations.lost - 1}
            })
        })

        ipcRenderer.on("INNER_LISTENER_UNSUCCESSFULLY_FINISHED", _ => {
            this.setState({
                mine_activations: {...this.state.mine_activations, dead: this.state.mine_activations.dead + 1, lost: this.state.mine_activations.lost - 1}
            })
        })

    }

    remote_trace = (socket) => {

        ipcRenderer.on("OUTER_LISTENER_ALERT", (e, options) => {
            // here is, sender only sends its socketId and receiver's, no any credentials sended to server, allways secret.
            let context = {
                sender: socket.id,
                receiver: options.socketId
            }

            // send to server to notify me
            socket.emit("OUTER_LISTENER_STARTED", context);
            
            // update remote machine's remote field of logger
            this.setState({
                remote_activations: {...this.state.remote_activations, received: this.state.remote_activations.received + 1}
            })

        })

        ipcRenderer.on("OUTER_LISTENER_UNSUCCESSFULLY_FINISHED_ALERT", (e, options) => {
            // here is, sender only sends its socketId and receiver's, no any credentials sended to server, allways secret.
            let context = {
                sender: socket.id,
                receiver: options.socketId
            }

            // send to server to notify me
            socket.emit("OUTER_LISTENER_UNSUCCESSFULLY_FINISHED", context);
            
            // update remot machine's remote field of logger
            this.setState({
                remote_activations: {...this.state.remote_activations, dead: this.state.remote_activations.dead + 1},
                max_remote_process: this.state.max_remote_process + 1
            })

        })

        ipcRenderer.on("OUTER_LISTENER_SUCCESSFULLY_FINISHED_ALERT", (e, options) => {
            // here is, sender only sends its socketId and receiver's, no any credentials sended to server, allways secret.
            let context = {
                sender: socket.id,
                receiver: options.socketId
            }

            // send to the server, inorder to notify me
            socket.emit("OUTER_LISTENER_SUCCESSFULLY_FINISHED", context);
            
            // update remote machine's remote field of logger
            this.setState({
                remote_activations: {...this.state.remote_activations, finished: this.state.remote_activations.finished + 1},
                max_remote_process: this.state.max_remote_process + 1
            })

        })

    }

    connectedUsers = count => {
        this.setState({connected_users: count})
    }

    render () {
        return (
            <div style={{height: "100%"}}>
                
                <Frame 
                search={this.props.search}
                allSearchActivities={this.props.searchState}
                loader={loader} 
                pageSurf={this.props.pageHistory} 
                pageSurfState={this.props.pageState} 
                settings={this.props.settingState} 
                send_proxy={this.props.updateProxy}
                send_cred={this.props.updateCred}
                connectedUsers={this.state.connected_users}
                connection={this.state.connection}
                mine_activations={this.state.mine_activations}
                remote_activations={this.state.remote_activations}
                socket={this.state.socket}
                query={this.state.query}
                mypage={this.state.mypage}
                dir={this.state.dir}
                />

            </div>
        )
    }
}

const mapStateToProps = (state) => {

    return {
        searchState: state.searchState,
        pageState: state.pageState,
        settingState: state.settingsState
    }

}

const mapDispatchToProps = (dispatch) => {

    return {

        search: entry => {
            dispatch(sendSearch(entry))
        },
        firstLoad: docs => {
            dispatch(loadHistory(docs))
        },
        firstPublicLoad: docs => {
            dispatch(loadPublicHistory(docs))
        },
        pageHistory: link => {
            dispatch(updatePageHistory(link))
        },
        fireProxy: settings => {
            dispatch(loadProxy(settings))
        },
        fireCred: settings => {
            dispatch(loadCredentials(settings))
        },
        updateProxy: settings => {
            dispatch(setProxy(settings))
        },
        updateCred: settings => {
            dispatch(setCredentials(settings))
        }

    }

}

export default connect(mapStateToProps, mapDispatchToProps)(App)