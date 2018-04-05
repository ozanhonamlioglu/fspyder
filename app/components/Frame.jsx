import React, { Component } from 'react'
import { BrowserRouter, Router, Route, Switch } from "react-router-dom";
import { PropsRoute, PublicRoute, PrivateRoute } from 'react-router-with-props';
import { createHashHistory } from 'history';

let history = createHashHistory();

// components...
import Header from "./Header.jsx";
import BrowserBody from "./browser/Browserbody.jsx";
import Footer from "./Footer.jsx";
import Settings from "./settings/Settings.jsx";
import Browse from "./browser/Browse.jsx";

class Frame extends Component {

    constructor(props){
        super(props)

        // mf -> mine finished, md -> mine dead
        // tgActivation -> show or hide the monitoring
        this.state = {
            tgActivation: false
        }
    }

    changeActivationStatus = _ => {
        this.setState({tgActivation: !this.state.tgActivation})
    }

    render () {
        const { loader } = this.props
        return (
            <div style={{height: "100%"}}>
                <Header
                    mine_activations={this.props.mine_activations}
                    remote_activations={this.props.remote_activations}
                    changeActivationStatus={this.changeActivationStatus}
                    tgActivation={this.state.tgActivation}
                />

                    <Router history={history}>
                        <span>

                            <PropsRoute 
                            exact 
                            path="/" 
                            search={this.props.search} 
                            component={BrowserBody} 
                            loader={loader} 
                            pageSurf={this.props.pageSurf} 
                            pageSurfState={this.props.pageSurfState}
                            settings={this.props.settings} 
                            />

                            <PropsRoute 
                            exact 
                            path="/settings" 
                            component={Settings} 
                            loader={loader} 
                            pageSurf={this.props.pageSurf} 
                            pageSurfState={this.props.pageSurfState} 
                            settings={this.props.settings} 
                            send_proxy={this.props.send_proxy}
                            send_cred={this.props.send_cred}
                            />

                            <PropsRoute
                            path="/browse"
                            component={Browse}
                            pageSurf={this.props.pageSurf} 
                            mine_activations={this.props.mine_activations}
                            query={this.props.query}
                            changeActivationStatus={this.changeActivationStatus}
                            mypage={this.props.mypage}
                            dir={this.props.dir}
                            />

                        </span>
                    </Router>

                <Footer 
                    connectedUsers={this.props.connectedUsers}
                    connection={this.props.connection}
                />

            </div>
        )
    }
}

export default Frame