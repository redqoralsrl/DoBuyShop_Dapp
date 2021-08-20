const DoBuyNFT = artifacts.require("DoBuyNFT");
const MarketNFT = artifacts.require("MarketNFT");

contract("DoBuyNFT", function(accounts) {
    let DoBuyNFTInstance;

    describe("DoBuyNFT Test", function() {

        it("DoBuyNFT 초기 정보 세팅 확인", function() {
            return DoBuyNFT.deployed().then(function(instance) {
                DoBuyNFTInstance = instance;
                return DoBuyNFTInstance._DoBuylist(0);
            }).then(function(NFTcard) {
                assert.equal(NFTcard[0], 0, "_Ids is not correct");
                assert.equal(NFTcard[2], "DoBuy Start!");
                assert.equal(NFTcard[3], "DoBuy.png");
            });
        });
    });
});

contract("MarketNFT", function(accounts) {
    let MarketNFTInstance;

    describe("MarketNFT Admin Test", function() {

        it("MarketNFT Market 초기 정보 세팅 확인", function() {
            return MarketNFT.deployed().then(function(instance) {
                MarketNFTInstance = instance;
                return MarketNFTInstance._MarketList(0);
            }).then(function(MarketList) {
                // assert.equal(MarketList[0], 0, "_ids is not correct");
                assert.equal(MarketList[1], 0, "price_ETH is not correct");
                assert.equal(MarketList[2], 0, "price_DoBuy is not correct");
                assert.equal(MarketList[3], "NFT SHOP", "name is not correct");
                assert.equal(MarketList[4], "DoBuy.png", "img_url is not correct");
            })
        });

        it("MarketNFT Market 등록 확인", function() {
            return MarketNFT.deployed().then(function(instance) {
                MarketNFTInstance = instance;
                MarketNFTInstance.setMarketList(1000000, 1000000000, "potato", "potato.png");
                return MarketNFTInstance._MarketList(1);
            }).then(function(MarketList) {
                // assert.equal(MarketList[0], 1, "_ids is not correct");
                console.log(MarketList[1].toString(),'+==================+');
                assert.equal(MarketList[1].toNumber(), 1000000, "price_ETH is not correct");
                assert.equal(MarketList[2].toNumber(), 1000000000, "price_DoBuy is not correct");
                assert.equal(MarketList[3], "potato", "name is not correct");
                assert.equal(MarketList[4], "potato.png", "img_url is not correct");
            })
        });
    })
})