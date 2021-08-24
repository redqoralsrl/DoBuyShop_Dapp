const DoBuyToken = artifacts.require("DoBuyToken");
const DoBuyNFT = artifacts.require("DoBuyNFT");
const MarketNFT = artifacts.require("MarketNFT");

module.exports = function(deployer) {
    deployer.deploy(DoBuyToken);
    // deployer.autolink();
    deployer.deploy(DoBuyNFT);
    // deployer.autolink();
    deployer.deploy(MarketNFT);
    deployer.link(DoBuyToken, [DoBuyNFT,MarketNFT]);
    // deployer.link(DoBuyToken, MarketNFT);
}