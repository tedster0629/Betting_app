import React, { Component } from 'react';

class Signout extends Component {

    signOut = () => {
        // IF BET DISABLE!!! TODO
        this.props.view();
        sessionStorage.clear();
    }

    render() {
        return (
            <div className="col-sm-12 pull-right">
                <div>U buttonu treba dodati disabled = "this.disablebutton" sa forme Dashboard</div> 
                <button className="signout pull-right" onClick={this.signOut}>Sign out</button>
            </div>
        );
    }
}

export default Signout;