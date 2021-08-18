const DoBuyNFT = artifacts.require("DoBuyNFT");

contract("DoBuyNFT", function(accounts) {
    let DoBuyInstance;

    describe("DoBuy Test", function() {

        it("PongNFT 초기 정보 세팅 확인", function() {
            return DoBuyNFT.deployed().then(function(instance) {
                DoBuyInstance = instance;
                return DoBuyInstance._DoBuylist(0);
            }).then(function(NFTcard) {
                assert.equal(NFTcard[0], 0, "_Ids is not correct");
                assert.equal(NFTcard[2], "DoBuy Start!");
                assert.equal(NFTcard[3], "");
            });
        });
    });
});