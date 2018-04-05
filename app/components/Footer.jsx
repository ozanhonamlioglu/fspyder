import React, { Component } from 'react'

// statics..
import nodes from "../static/node.svg";
import padlock from "../static/padlock.svg";
import network from "../static/network.svg";
import theconnection from "../static/connection.gif";

class Footer extends Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        
    }

    handlePrevent = e => {
        e.preventDefault();
    }

    no_internet = _ => {

        return (

            <div className="internetAlert">
                <div style={{width: "60px", height: "60px", float: "left", background: ""}}>
                    <img src={theconnection} alt="" style={{position:"relative", top: "-70px", right:"70px"}}/>
                </div>
                <div style={{float: "right", background: ""}}>
                    <p style={{position: "relative", top:"3px"}}><b>Server offline?</b></p>
                </div>
            </div>

        )

    }

    render () {
        return (
            <span>
                <div style={{margin: "0px", padding: "10px", position:"fixed", bottom:"0", width: "70%"}}>
                    <div className="ion-col-8">
                        <a onClick={e => this.handlePrevent(e)} className="ion-tag ion-tag-size"><img src={network} className="ion-tag-images-size"/>&nbsp;How it works?</a><span>&nbsp;&nbsp;</span>
                        <a onClick={e => this.handlePrevent(e)} className="ion-tag ion-tag-size" style={{color: "#D40000"}}><img src={padlock} className="ion-tag-images-size"/>&nbsp;Privacy policy</a><span>&nbsp;&nbsp;</span>
                        <a onClick={e => this.handlePrevent(e)} className="ion-tag ion-tag-size" style={{color: "#007506"}}><img src={nodes} className="ion-tag-images-size"/>&nbsp;Active nodes: {this.props.connectedUsers}</a>
                    </div>
                    <div className="ion-col-8" style={{textAlign: "right"}}>
                    </div>
                </div>

                {
                    this.props.connection === false
                    ?
                    this.no_internet()
                    :
                    ""
                }

            </span>
        )
    }
}

export default Footer