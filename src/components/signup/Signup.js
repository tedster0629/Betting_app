import React, { Component } from 'react';
import nodeUrl from '../../eth-node-config.json';
import Web3 from 'web3';
import compiledContract from '../../truffle/build/contracts/BettingApp.json';

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

class Signup extends Component {

    state = {
        inputUsername: '',
        inputPassword: ''
    };

    // update username state
    updateUsername = (e) => {
        this.setState({
            inputUsername: e.target.value
        });
    }

    // update password state
    updatePassword = (e) => {
        this.setState({
            inputPassword: e.target.value
        });
    }

    /**
     * Create new account
     */
    createNewAccount = () => {
        const pass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        web3.eth.personal.newAccount(pass).then(address => {
            const newAddress = address;
            web3.eth.personal.unlockAccount(address, pass, 0).then(() => {
                web3.eth.sendTransaction({ from: coinbaseAddress, to: newAddress, value: web3.utils.toWei("5", "ether") });
                    contractInstance.methods.createNewAddress(newAddress, pass).send({ from: coinbaseAddress, gas: 200000 });
            });
        });
    }

    signUp = () => {
        // check if there is empty field
        if (this.state.inputUsername === '' || this.state.inputPassword === '') {
            alert('Username or password field is empty');
            return;
        }
        // check if username exist
        contractInstance.methods.checkIfUserExist(this.state.inputUsername).call().then(receipt => {
            if (!receipt) {
                // check if there is available address
                contractInstance.methods.getAvailableAddresses().call().then((receipt) => {
                    if (receipt > 0) {
                        // register user
                        contractInstance.methods.registerUser(this.state.inputUsername, this.state.inputPassword).send({ from: coinbaseAddress, gas: 200000 });
                    } else {
                        // create new account that will be available for new users
                        this.createNewAccount();
                    }
                });
            } else {
                alert('Username already exists.');
            }
        });
    }

    render() {
        return (
            <div className="signup-wrapper">
                <h1>Register For An Account</h1>
                <p>Insert username and password to register new account.</p>
                <input  onChange={this.updateUsername} className="usernamesu" type="text" placeholder="Username"/>
                <div>
                  <p className="usernamesu-help">Please enter your username.</p>
                </div>
                <input onChange={this.updatePassword} className="passwordsu" type="password" placeholder="Password"/>
                <div>
                  <p className="passwordsu-help">Please enter your password.</p>
                </div>
                <button type="submit" onClick={this.signUp}>Sign up</button>
            </div>
        );
    }
}

export default Signup;