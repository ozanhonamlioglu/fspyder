import React, { Component } from 'react'
import moment from 'moment';

// statics...
import spy from "../../static/spy.png";

class BrowserBody extends Component {

    constructor(props){
        super(props)
        this.state = {
            searchBox: null,
            mainPage: null
        }

    }

    componentDidMount(){

        // updating page histroy manually, crap.
        this.props.pageSurf("/")

        this.setState({
            mainPage: this.pageRenderLoader()
        })

        setTimeout(() => {
            this.setState({
                mainPage: this.pageRenderMain()
            })
        }, 1000);

    }

    pageRenderLoader = _ => {
        return <div className="ion-container ion-vertical-center">
            <h3>
                <img src={this.props.loader} alt=""/>
            </h3>
        </div>
    }

    pageRenderMain = _ => {
        return <div className="ion-container ion-vertical-center">     
            <h3 className="main-search-bar-text">
                FSPYDER
                <img src={spy} alt="" className="spy-icon"/>
            </h3>
            <br/>
            <form onSubmit={e => this.handleSubmit(e)}>
                <input type="text" className="ion-input-text main-search-bar" placeholder="P2P Search on facebook" onChange={e => this.setState({searchBox: e.target.value})}/>
            </form>
        </div>
    }

    handleSubmit = e => {
        e.preventDefault();
        let search = this.state.searchBox.trim("");
        const { credentials, proxy } = this.props.settings

        if(search){
            search = search;
            const searcInformations = {
                search,
                date: moment().format("DD/MM/YY hh:mm:ss"),
                proxy,
                credentials
            }
            this.props.search(searcInformations)
        }

    }

    render () {
        return (
            <div className="ion-hero ion-general-main-body">
                { this.state.mainPage }
            </div>
        )
    }
}

export default BrowserBody