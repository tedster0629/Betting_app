var bettingApp = artifacts.require("BettingApp");

module.exports = function (deployer) {
    deployer.deploy(bettingApp);
};