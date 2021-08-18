const DoBuyToken = artifacts.require("DoBuyToken");
const DoBuyNFT = artifacts.require("DoBuyNFT");

module.exports = function(deployer) {
    deployer.deploy(DoBuyToken);
    deployer.link(DoBuyToken, DoBuyNFT);
    deployer.deploy(DoBuyNFT);
}