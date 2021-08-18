const DoBuy = artifacts.require("DoBuy");
const DoBuyNFT = artifacts.require("DoBuyNFT");

module.exports = function(deployer) {
    deployer.deploy(DoBuy);
    deployer.link(DoBuy, DoBuyNFT);
    deployer.deploy(DoBuyNFT);
}