import React, { Component } from 'react';
import nodeUrl from './eth-node-config.json';
import ethHistory from './update_service/ethHistory.json';
import './App.css';
import Web3 from 'web3';
import compiledContract from './truffle/build/contracts/BettingApp.json';
import Signup from './components/signup/Signup';
import Signin from './components/signin/Signin';
import Signout from './components/signout/Signout';
import Dashboard from './components/dashboard/Dashboard';
import EthPrice from './components/ethPrice/EthPrice';
import Timer from './components/timer/Timer';
import moment from 'moment';
import Chart from 'chart.js';

/**
 * Create web3 instance
 */
const web3 = new Web3(nodeUrl.url);

/**
 * Unlock coinbase address
 */
web3.eth.getCoinbase().then(result => {
  const coinbaseAddress = result;
  web3.eth.personal.unlockAccount(coinbaseAddress, 'koliko', 0);
});

/**
 * Get address from compiled contract
 */
const contractAddress = compiledContract.networks['300'].address;

/**
 * Get contract balance
 */
web3.eth.getBalance(contractAddress, function (err, balance) {
  if (err) {
    console.error(err);
  } else {
    console.log('Contract address: ' + contractAddress);
    console.log('Contract balance: ' + balance);
  }
});

/**
 * Create contract instance
 */
const contractInstance = new web3.eth.Contract(compiledContract.abi, contractAddress);
console.log(contractInstance);

/**
 * List all accounts with their balance
 */
// web3.eth.getAccounts().then(result => {
  // result.forEach(address => {
    // web3.eth.getBalance(address).then(balance => {
      // console.log('Address: ' + address + ', balance: ' + web3.utils.fromWei(balance, 'ether') + ' ether');
    // });
  // });
// });

class App extends Component {

  constructor(props){
super(props);
    this.state = {
      showSignup: true,
      showSignin: true,
      showDashboard: false,
      showEthPrice: false,
      showSignout: false,
    }
  }


  hideSignin() {
    this.setState({
      showSignin: !this.state.showSignin,
      showSignout: !this.state.showSignout,
      showSignup:!this.state.showSignin,
      showDashboard: !this.state.showSignout,
      showEthPrice: !this.state.showSignout,
    })
  }

  render() {
    let signup = null;
    if (this.state.showSignup) {
      signup = (<Signup view={this.hideSignin.bind(this)}/>);
    }

    let signin = null;
    if (this.state.showSignin) {
      signin = (<Signin view={this.hideSignin.bind(this)}/>);
    }

    let signout = null;
    if (this.state.showSignout) {
      signout = (<Signout view={this.hideSignin.bind(this)}/>);
    }

    let dashboard = null;
    if (this.state.showDashboard) {
      dashboard = (<Dashboard view={this.hideSignin.bind(this)}/>);
    }
    
    let ethPrice = null;
    if (this.state.showEthPrice) {
      ethPrice = (<EthPrice view={this.hideSignin.bind(this)}/>);
    }

    return (
      <div className="App">
        <div className="container">
            <div className="row">
              {signout}
            </div>
            <div className="row">
              <div className="col-sm-6">
                {signup}
              </div>
              <div className="col-sm-6">
                {signin}
              </div>
            </div>
            <div className="row">
                {ethPrice}
            </div>
            <div className="row">
              <div className="col">
                {dashboard}
              </div>
            </div>
        </div>
      </div>
    );
  }
}

export default App;
