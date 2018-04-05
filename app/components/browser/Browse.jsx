import React, { Component } from 'react'
import logger from "../../static/logger.svg";
import renderHTML from 'react-render-html';

// Renderer process
import { ipcRenderer } from "electron";

class Browse extends Component {

    constructor(props){
        super(props)
    }

    componentDidMount(){
        // updating page histroy manually, crap.
        this.props.pageSurf("/browse")
    }

    my_page = _ => {
        return <div className="ion-container ion-general-main-body">
            <div className="ion-container ion-vertical-center renderthispage">
                {
                    renderHTML(this.props.mypage)
                }
            </div>
        </div>
    }

    initial_page = _ => {

        return (
            <div className="ion-hero ion-general-main-body">
                <div className="ion-container ion-vertical-center">

                    <span>
                        <span>The "{this.props.query}" is sended to {this.props.mine_activations.lost} different nodes including yourself.</span>
                        <span>Check "{this.props.dir}/" folder, your searched pages will load in that folder.</span>
                        <br/><br/>
                        <span>Keep trace your spyders from 
                        <span>&nbsp;&nbsp;</span><a onClick={_ => this.props.changeActivationStatus()} className="ion-tag ion-tag-size"><img src={logger} className="ion-tag-images-size"/>&nbsp;Logger</a><span>&nbsp;&nbsp;</span></span>
                    </span>

                </div>
            </div>
        )
        
    }

    render () {
        return (
            <span>

                {  
                    this.initial_page()
                }

            </span>
        )
    }
}

export default Browse