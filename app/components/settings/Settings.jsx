import React, { Component } from 'react'
import { ipcRenderer } from 'electron'

import { createHashHistory } from 'history';
let history = createHashHistory();

import back from "../../static/back.svg";
import $ from 'jquery';

class Settings extends Component {

    constructor(props){
        super(props)

        this.state = {
            mainPage: null,
            settingPage: null,
            pageLoaded: 0,
            proxy: {desc: "proxy", prx:"", port: "", username: "", password: ""},
            credentials: {desc: "cred", username: "", password: ""}
        }

    }

    settings_cube = [
        {desc: <span style={{cursor: "pointer"}} onClick={_ => this.goBack()}><img src={back} style={{width: "20px", height: "20px"}}/></span>},
        {desc: "Set proxy", class:"ion-info", tab: _ => { this.tab_merge("proxy") } },
        {desc: "Set username and password", class: "ion-alert", tab: _ => { this.tab_merge("credentials") } },
        // {desc: "Set cookies", class:"ion-safe", tab: _ => { this.tab_merge("cookie") } },
        {desc: "See search history", class: "ion-safe"},
        {desc: "Try passwords!", class: "ion-info"}
    ]

    tab_merge = name => {


        new Promise((resolve, reject) => {

            this.setState({
                settingPage: this.innerPageRenderLoader()
            })

            setTimeout(() => {
                resolve(console.log("ok it worked"));          
            }, 500)

        })
        .then(_ => {

            switch(name){

                case "cookie":
                    this.setState({
                        settingPage: this.cookieTab()
                    })
                    break;
                
                case "credentials":
                    this.setState({ 
                        settingPage: this.credentialsTab() 
                    })
                    break;
    
                case "proxy":
                    this.setState({ 
                        settingPage: this.proxyTab() 
                    })
                    break;
    
    
                default:
                    break;
    
            }

        })


    }

    componentWillUnmount(){

        // get proxy settings
        const {proxy} = this.state

        // get cred settings
        const {credentials} = this.state

        // send proxy settings to main process...
        if(proxy.prx != undefined && proxy.port != undefined){
            this.props.send_proxy(proxy)
        }

        // send credentials settings to main process...
        if(credentials.username != undefined && credentials.password != undefined){
            this.props.send_cred(credentials)
        }

    }

    componentDidMount(){

        // updating page histroy manually, crap.
        this.props.pageSurf("/settings")

        // set if proxy is defined in nedb
        if(this.props.settings.proxy){
            this.setState({
                proxy: { ...this.props.settings.proxy }
            })
        }

        // set if cred is defined in nedb
        if(this.props.settings.credentials){
            this.setState({
                credentials: { ...this.props.settings.credentials }
            })
        }
        
        this.setState({
            mainPage: this.pageRenderLoader()
        })

        setTimeout(() => {
            this.setState({
                mainPage: this.pageRenderMain(),
                settingPage: <h3>SETTINGS</h3>,
                pageLoaded: 1
            })
            // animate the cubes
            this.cube_animations()
        }, 1000);

    }

    goBack = _ => {

        const before = this.props.pageSurfState.length - 2
        const thePage = this.props.pageSurfState[before]
        history.replace("spyder");
        history.push(thePage);

    }

    cube_animations = _ => {

        let cube_count = $(".settings-cube").length;
        let margin_size = $(".settings-cube").css("margin-left");
        
        $(".settings-cube").css("margin-left", "30px");
    
        $(".settings-cube").fadeIn({queue: false, duration: "slow"})
        $(".settings-cube").animate({
            "margin-left": margin_size
        }, 1000)

    }

    pageRenderLoader = _ => {
        return <div className="ion-container ion-vertical-center">
            <h3>
                <img src={this.props.loader} alt=""/>
            </h3>
        </div>
    }

    innerPageRenderLoader = _ => {
        return <h3>
                <img src={this.props.loader} alt=""/>
            </h3>
    }

    pageRenderMain = _ => {
        return <div>

            <div className="ion-grid" style={{margin: "0px", padding: "0px"}}>

                <div className="ion-col-16">
                {
                    this.settings_cube.map((data, key) => {
                        return (
                        key === 0
                        ?
                        <div key={key} className="settings-cube">
                            {data.desc}
                        </div>
                        :
                        <div key={key} className={"settings-cube ion-label "+data.class} onClick={data.tab}>
                            {data.desc}
                        </div>
                        )
                    })

                }
                </div>
            
            </div>

        </div>
        
    }

    setProxy = (input, data) => {

        switch(input){
            case "prx":
                this.setState({
                    proxy: {...this.state.proxy, prx:data}
                })
                break;

            case "port":
                this.setState({
                    proxy: {...this.state.proxy, port:data}
                })
                break;

            case "username":
                this.setState({
                    proxy: {...this.state.proxy, username:data}
                })
                break;
            
            case "pass":
                this.setState({
                    proxy: {...this.state.proxy, password:data}
                })
                break;

            default:
                break;
        }

    }

    setCredentials = (input, data) => {

        switch(input){
            case "username":
                this.setState({
                    credentials: {...this.state.credentials, username:data}
                })
                break;
            
            case "pass":
                this.setState({
                    credentials: {...this.state.credentials, password:data}
                })
                break;

            default:
                break;
        }

    }

    proxyTab = _ => {

        return (
            <form onSubmit={e => this.handleSubmit(e)}>
                <table className="ion-table">
                    <tbody>

                        <tr>
                            <td>Proxy</td>
                            <td><input type="text" id="prx-prx" className="proxy-input" placeholder="Proxy link ie: 127.0.0.1" defaultValue={ this.state.proxy.prx ? this.state.proxy.prx : "" } onChange={e => this.setProxy("prx", e.target.value)}/></td>
                        </tr>
                        <tr>
                            <td>Port</td>
                            <td><input type="text" id="prx-port" className="proxy-input" placeholder="Proxy port ie: 9000" defaultValue={ this.state.proxy.port ? this.state.proxy.port : "" } onChange={e => this.setProxy("port", e.target.value)}/></td>
                        </tr>
                        <tr>
                            <td>Username (optional)</td>
                            <td><input type="text" id="prx-username" className="proxy-input" placeholder="Set, if username" defaultValue={ this.state.proxy.username ? this.state.proxy.username : "" } onChange={e => this.setProxy("username", e.target.value)}/></td>
                        </tr>
                        <tr>
                            <td>Password (optional)</td>
                            <td><input type="password" id="prx-password" className="proxy-input" placeholder="Set, if password" defaultValue={ this.state.proxy.password ? this.state.proxy.password : "" } onChange={e => this.setProxy("pass", e.target.value)}/></td>
                        </tr>

                    </tbody>
                </table>
                <p className="dipnot" style={{fontSize: "12px"}}>* Proxy is not usally needed, because when you attempt to search via your nodes, then your (computer details and any kind of search related stuff except session credentials) are going to be stored on the server also in nodes due to criminal issues. Only the proxy could be useful is, if you are using tools such as port scanner etc.</p>
            </form>
        )
        

    }

    credentialsTab = _ => {

        return (
            <form onSubmit={e => this.handleSubmit(e)}>
                <table className="ion-table">
                    <tbody>
    
                        <tr>
                            <td><span className="required">*</span> Username</td>
                            <td><input type="text" className="proxy-input" placeholder="Facebook username" defaultValue={ this.state.credentials.username ? this.state.credentials.username : "" } onChange={e => this.setCredentials("username", e.target.value)} /></td>
                        </tr>
                        <tr>
                            <td><span className="required">*</span> Password</td>
                            <td><input type="password" className="proxy-input" placeholder="Facebook password" defaultValue={ this.state.credentials.password ? "security" : "" } onChange={e => this.setCredentials("pass", e.target.value)} /></td>
                        </tr>
    
                    </tbody>
                </table>
                <p className="dipnot" style={{fontSize: "12px"}}><span className="required">*</span> Please see "Privacy Policy" page. Your user informations including returned session cookies, neither on server nor on peer will never be stored and session cookies will never be visible by any peer if they use any kind of PortSwigger after response made. We guarantee that your informations will never be stolen when you make any search or searched by your peers. Your credentials are only a token. All guarantees are valid even if FSpyder Main Server is under attack.</p>
            </form>
            )


    }

    cookieTab = _ => {

        return (
            <form onSubmit={e => this.handleSubmit(e)}>
                <table className="ion-table">
                    <tbody>

                        <tr>
                            <td><span className="required">*</span> Cookies</td>
                            <td><input type="text" className="proxy-input" placeholder="Facebook cookies" /></td>
                        </tr>

                    </tbody>
                </table>
                <p className="dipnot" style={{fontSize: "12px"}}><span className="required">*</span> For advenced users! If you dont want to set your facebook password and username, then alternatively copy paste any active your facebook session cookies into the field. FSpyder will work accordingly.</p>
            </form>
        )

    }

    handleSubmit = e => {
        e.preventDefault();
    }

    render () {
        return (
            <div className="ion-hero ion-general-main-body">
                { this.state.mainPage }

                {
                    this.state.pageLoaded == 0
                    ?
                    ""
                    :
                    <div className="ion-grid">
                        <div className="ion-col-16">
                            <div className="ion-hero" style={{height: "50vh", background: "#fff"}}>
                                <div className="ion-container ion-vertical-center">
                                    {
                                        this.state.settingPage
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }

            </div>
        )
    }
}

export default Settings