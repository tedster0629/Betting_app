import React, { Component } from 'react';
import nodeUrl from '../../eth-node-config.json';
import Web3 from 'web3';
import compiledContract from '../../truffle/build/contracts/BettingApp.json';
import Timer from '../timer/Timer.js';
/**
 * Create web3 instance
 */
const web3 = new Web3(nodeUrl.url);

/**
 * Get address from compiled contract
 */
const contractAddress = compiledContract.networks['300'].address;

/**
 * Create contract instance
 */
const contractInstance = new web3.eth.Contract(compiledContract.abi, contractAddress);

/**
 * Get coinbase address
 */
let coinbaseAddress = '';
web3.eth.getCoinbase().then(result => {
    coinbaseAddress = result;
});


class Dashboard extends Component {
  constructor(dashboardProps) {
    super(dashboardProps)  
    this.state = {
        inputValue: '',
        disablebutton: false,
        showTimer: true
    }
  }
    
    // update value state
    updateValue = (e) => {
        this.setState({
            inputValue: e.target.value
        });
    }

    BetUp = () => {
        // check if there is empty field
        if (this.state.inputValue === '') {
            alert('Value field is empty');
            return;
        }
        // check if user is logged in
        if((global.loggedInAddress === '0x0000000000000000000000000000000000000000') || (global.loggedInAddress === '') || (global.loggedInAddress === null)) {
            alert('You are not logged in');
            return;
        }
        // unlock user's address
        contractInstance.methods.getAddressPass(global.loggedInAddress).call({ from: coinbaseAddress }).then((addressPass) => {
            web3.eth.personal.unlockAccount(global.loggedInAddress, addressPass, 0);
        });
        //disable click on elements until bet accepted
        this.setState({
            disablebutton: !this.state.disablebutton
        });
        // place bet 
        contractInstance.methods.purchaseBet(1).send({from: global.loggedInAddress, value: web3.utils.toWei(this.state.inputValue, "ether"), gas: 300000}).then(receipt => {
            if (receipt) {
                sessionStorage.setItem('type', this.state.inputValue);
                //disable click on elements until bet accepted
                this.setState({
                    disablebutton: !this.state.disablebutton
                });
                alert('Bet accepted');
            } else {
                sessionStorage.setItem('type', '');
                //disable click on elements until bet accepted
                this.setState({
                    disablebutton: !this.state.disablebutton
                });
                alert('Bet rejected');
            }
        });
    }
    BetDown = () => {
            // check if there is empty field
            if (this.state.inputValue === '') {
                alert('Value field is empty');
                return;
            }
            // check if user is logged in
            if((global.loggedInAddress === '0x0000000000000000000000000000000000000000') || (global.loggedInAddress === '') || (global.loggedInAddress === null)) {
                alert('You are not logged in');
                return;
            }
            // unlock user's address
        contractInstance.methods.getAddressPass(global.loggedInAddress).call({ from: coinbaseAddress }).then((addressPass) => {
                web3.eth.personal.unlockAccount(global.loggedInAddress, addressPass, 0);
            });
            //disable click on elements until bet accepted
            this.setState({
                disablebutton: !this.state.disablebutton
            });
            // place bet 
            contractInstance.methods.purchaseBet(2).send({from:global.loggedInAddress , value:web3.utils.toWei(this.state.inputValue, "ether"), gas: 300000}).then(receipt => { 
                if (receipt) {
                    sessionStorage.setItem('type', this.state.inputValue);
                    this.setState({
                        disablebutton: !this.state.disablebutton
                    });
                    alert('Bet accepted');
                } 
                else {
                    sessionStorage.setItem('type', '');
                    this.setState({
                        disablebutton: !this.state.disablebutton
                    });
                    alert('Bet rejected');
                }
            });
    }
    render() {
        let timer = null;
        if(this.state.showTimer) {
          timer = (<Timer />);
        }
        return (
            <div className="dashboard-wrapper">
                <div className="row">
                    <div className="col-sm-6">
                    <input onChange={this.updateValue} type="text" placeholder="Bet value (ETH)"/>   
                    </div>
                    <div className="col-sm-3">
                        <button disabled={this.state.disablebutton} className="betup" onClick={this.BetUp}>Bet up</button>
                    </div>
                    <div className="col-sm-3">
                        <button disabled={this.state.disablebutton} className="betdown" onClick={this.BetDown}>Bet down</button>
                    </div>
                </div>
                {
                    this.state.disablebutton?
                    <div className="loading-wrapper">
                    <div className="row">
                        <div className="col-sm-6 column-in-center">
                            <h2>Accepting bet...</h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-2 column-in-center">
                            <div className="loader"></div>
                        </div>
                    </div>
                    </div>
                :null
                }
            <div className="row">
                {timer}
            </div>
            </div>
        );
    }
}

export default Dashboard;