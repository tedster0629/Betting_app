import React, { Component } from 'react';
import ethData from '../../update_service/ethData.json';

class EthPrice extends Component {

    state = {
        price: ethData.currentEthPrice,
        betPrice: ethData.betEthPrice,
        priceDifference: ((ethData.currentEthPrice / ethData.betEthPrice - 1) * 100).toFixed(2)
    }

/**
 * After all the elements of the page is rendered correctly, this method is called by React itself to either fetch the data from An External API or perform some unique operations which need the JSX elements.
 // https://apiv2.bitcoinaverage.com/indices/global/ticker/ETHUSD  // https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD
 */
    componentDidMount(){        
        setInterval( () => {
            this.setState({
                price: ethData.currentEthPrice,
                betPrice: ethData.betEthPrice,
                priceDifference: ((ethData.currentEthPrice / ethData.betEthPrice - 1) * 100).toFixed(2)
            });
        }, 10000)
    }

    render() {
        return (
        <div className="ethPrice-wrapper col">
            <div className="row">
                <div className="col-4">
                    <h1>Betting against</h1>
                    <p>ETH/USD</p>
                    <h2>${this.state.betPrice}</h2>
                </div>
                <div className="col-4">
                    <h1>Price difference</h1>
                    <p>%</p>
                    <h2>{this.state.priceDifference}%</h2>
                </div>
                <div className="col-4">
                    <h1>Current Ethereum Price</h1>
                    <p>ETH/USD</p>
                    <h2>${this.state.price}</h2>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <canvas id="myChart" width="100%" height="30%"></canvas>
                </div>
            </div>
        </div>
        );
    }
}

export default EthPrice;