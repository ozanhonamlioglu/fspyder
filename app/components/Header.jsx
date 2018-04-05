import React, { Component } from 'react'
import $ from 'jquery';

// Renderer process
import { ipcRenderer } from "electron";

import { createHashHistory } from 'history';
let history = createHashHistory();

// statics..
import Settings from "../static/settings.svg";
import notification from "../static/notification.svg";
import notificatioff from "../static/notificatioff.svg";
import homebtn from "../static/home.svg";
import logger from "../static/logger.svg";

class Header extends Component {

    constructor(props){
        super(props)
    }

    componentDidMount(){

        ipcRenderer.on("INNER_LISTENER_SENDED", _ => {
            this.returnPage("/browse")
        })

    }

    returnPage = page => {
        history.replace("spyder");
        history.push(page);
    }

    handlePrevent = e => {
        e.preventDefault();
    }


    toggleActivation = e => {
        e.preventDefault();
        this.props.changeActivationStatus()
    }

    activation = _ => {

        return (

            <div className="logger">

            <table className="ion-table">
                <thead style={{background: "rgba(0,0,0,0)", color: "#fff", fontSize: "12px"}}>
                    <tr>
                        <th>Live</th>
                        <th><div className="littlecircle" style={{background: "#FFCF00"}}></div>S/R</th>
                        <th><div className="littlecircle" style={{background: "#00D774"}}></div>Finished</th>
                        <th><div className="littlecircle" style={{background: "#FF0000"}}></div>Dead</th>
                        <th><div className="littlecircle" style={{background: "#2687EE"}}></div>P/L</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{color: "#fff", fontSize: "12px"}}>
                        <td>Mine (S)</td>
                        <td>{ this.props.mine_activations.sended }</td>
                        <td>{ this.props.mine_activations.finished }</td>
                        <td>{ this.props.mine_activations.dead }</td>
                        <td>{ this.props.mine_activations.lost }</td>
                    </tr>
                    <tr style={{color: "#fff", fontSize: "12px"}}>
                        <td>Public (R)</td>
                        <td>{ this.props.remote_activations.received }</td>
                        <td>{ this.props.remote_activations.finished }</td>
                        <td>{ this.props.remote_activations.dead }</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>

            </div>

        )


    }


    render () {
        return (
            <span>
            <div className="ion-grid" style={{margin: "0px", padding: "10px"}}>
                <div className="ion-col-8">
                    <a onClick={e => this.handlePrevent(e)} className="ion-tag">Version 1.0</a>
                </div>
                <div className="ion-col-8" style={{textAlign: "right"}}>
                    <a onClick={e => this.toggleActivation(e)} className="ion-tag ion-tag-size"><img src={logger} className="ion-tag-images-size"/>&nbsp;Logger</a><span>&nbsp;&nbsp;</span>
                    <a onClick={() => this.returnPage("/")} className="ion-tag ion-tag-size"><img src={homebtn} className="ion-tag-images-size"/>&nbsp;Home</a><span>&nbsp;&nbsp;</span>
                    <a onClick={() => this.returnPage("/settings")} className="ion-tag ion-tag-size">Settings&nbsp;<img src={Settings} className="ion-tag-images-size"/></a>
                </div>


            </div>

                {
                    this.props.tgActivation
                    ?
                    this.activation()
                    :
                    null
                }

            </span>
        )
    }
}

export default Header