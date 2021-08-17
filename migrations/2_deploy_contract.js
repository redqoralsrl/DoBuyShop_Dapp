const PongNFT = artifacts.require("PongNFT");

module.exports = function(deployer) {
    deployer.deploy(PongNFT);
};