const nodeUrl = require('../eth-node-config'),
	async = require('async'),
	request = require('request'),
	fs = require('fs'),
	Web3 = require('web3'),
	compiledContract = require('../truffle/build/contracts/BettingApp.json'),
	web3 = new Web3(nodeUrl.url),
	contractAddress = compiledContract.networks['300'].address,
	contractInstance = new web3.eth.Contract(compiledContract.abi, contractAddress);

let coinbaseAddress = '',
	creatingAddress = false,
	currentTime = {
		'year': '',
		'month': '',
		'day': '',
		'hour': '',
		'minute': '',
		'second': ''
	},
	lastPayoutTime = '',
	betPriceSet = false,
	ethData = {
		'currentEthPrice': '',
		'betEthPrice': '',
		'roundTime': ''
	},
	json_ethHistory = {};

/**
 * Get coinbase address
 */
web3.eth.getCoinbase().then(result => {
	coinbaseAddress = result;
});

/**
 * Set initial eth price values and round time when service is restarted
 */
fs.readFile('ethData.json', function (err, data) {
	var json = JSON.parse(data);
	ethData.currentEthPrice = json.currentEthPrice;
	ethData.betEthPrice = json.betEthPrice;
	ethData.roundTime = json.roundTime;
});

/**
 * Create address for new users if there is not enough in the address poll
 */
createNewAddress = () => {
	if (coinbaseAddress != '') {
		contractInstance.methods.getAvailableAddresses().call().then(receipt => {
			console.log('Number of available addresses: ' + receipt);
			if (receipt < 50 && !creatingAddress) {
				creatingAddress = true;
				console.log('Not enough addresses in the pool, creating new address.');
				const pass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
				web3.eth.personal.newAccount(pass).then(address => {
					const newAddress = address;
					web3.eth.personal.unlockAccount(address, pass, 0).then(() => {
						web3.eth.sendTransaction({ from: coinbaseAddress, to: newAddress, value: web3.utils.toWei("5", "ether") }).then(receipt => {
							console.log('Created new address, gas spent: ' + receipt.gasUsed);
							contractInstance.methods.createNewAddress(newAddress, pass).send({ from: coinbaseAddress, gas: 200000 }).then(receipt => {
								creatingAddress = false;
								console.log('New address is now available, gas spent: ' + receipt.gasUsed);
							});
						});
					});
				});
			}
		});
	}
}

main = () => {

	async.series([

		/**
		 * Update current time
		 */
		updateTime = (callback) => {
			const time = new Date();
			currentTime.year = time.getYear() + 1900;
			currentTime.month = time.getMonth() + 1;
			currentTime.day = time.getDate();
			currentTime.hour = time.getHours();
			currentTime.minute = time.getMinutes();
			currentTime.second = time.getSeconds();
			callback(null, '');
		},

		/**
		 * Get current ETH price, set the bet price and set round start time
		 */
		getEthPrice = (callback) => {
			request({
				url: "https://api.bittrex.com/api/v1.1/public/getticker?market=USD-ETH",
				json: true
			}, function (error, response, data) {
				if (!error && response.statusCode === 200) {
					if (typeof data !== 'undefined') {
						ethData.currentEthPrice = parseFloat(data.result.Last.toFixed(2));
						if ((currentTime.minute == 2 || currentTime.minute == 32) && !betPriceSet) {
							ethData.betEthPrice = parseFloat(data.result.Last.toFixed(2));
							ethData.roundTime = currentTime.month + '-' + currentTime.day + '-' + currentTime.year + ' ' + currentTime.hour + ':' + currentTime.minute + ':' + currentTime.second;
							betPriceSet = true;
						}
						json_ethHistory.price = ethData.currentEthPrice;
						json_ethHistory.timestamp = currentTime.day + '/' + currentTime.month + '/' + currentTime.year + ' ' + currentTime.hour + ':' + currentTime.minute;
						console.log('Betting against ETH price: ' + ethData.betEthPrice + ' | Current ETH price: ' + ethData.currentEthPrice);
					}
					callback(null, '');
				} else {
					callback(null, '');
				}
			});
		},

		/**
		 * Distribute rewards on time
		 */
		distributeRewards = (callback) => {
			if ((currentTime.minute == 0 || currentTime.minute == 30) && lastPayoutTime != currentTime.hour + ':' + currentTime.minute) {
				let winningBet = 0;
				if (((ethData.currentEthPrice / ethData.betEthPrice - 1) * 100) > 0) {
					winningBet = 1;
				} else {
					winningBet = 2;
				}
				contractInstance.methods.payWinnigBets(winningBet).send({ from: coinbaseAddress, gas: 500000 }).then(receipt => {
					console.log('Rewards distributed, gas spent: ' + receipt.gasUsed);
					lastPayoutTime = currentTime.hour + ':' + currentTime.minute;
					betPriceSet = false;
					callback(null, '');
				});
			} else {
				console.log('Rewards are not paid out, current time is: ' + currentTime.hour + ':' + currentTime.minute + ':' + currentTime.second);
				callback(null, '');
			}
		}

	], (error, result) => {
		if (error) {
			console.log(' ');
			console.log('Something went wrong :(');
			console.log('-----------------------');
			const errorTime = new Date();
			console.log(errorTime + ': ' + error);
			console.log('-----------------------');
			console.log('');
		} else {
			// save eth price and time data
			const json = JSON.stringify(ethData);
			fs.writeFile("ethData.json", json, function (err) {
				const logTime = new Date();
				// console.log(logTime + ': Data saved.');
				setTimeout(main, 10000);
				createNewAddress();
			});
			// save eth price history
			fs.readFile('ethHistory.json', function (err, data) {
				let json = JSON.parse(data);
				json.splice(0, json.length - 1000);
				json.push(json_ethHistory);
				const new_json = JSON.stringify(json);
				fs.writeFile("ethHistory.json", new_json, function (err) {
					const logTime = new Date();
					console.log(logTime + ': ETH history data saved.');
				});
			});
		}
	});
}
main()