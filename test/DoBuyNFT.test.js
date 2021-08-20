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
                
            }).then(function() {})
        });

        it("MarketNFT Market 등록 확인", function() {
            return MarketNFT.deployed().then(function(instance) {
                MarketNFTInstance = instance;
                MarketNFTInstance.setMarketList(0.001, 150, "potato", "potato.png");
                return MarketNFTInstance._MarketList(1);
            }).then(function(MarketList) {})
        });
    })
})