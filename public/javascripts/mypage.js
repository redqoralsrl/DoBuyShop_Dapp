MyPage = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return MyPage.initWeb3();
    },

    initWeb3: async function() {
        if(window.ethereum) {
            MyPage.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch(error) {
                console.error("user denied account access");
            }
        } else if(window.web3) {
            MyPage.web3Provider = window.web3.currentProvider;
        } else {
            MyPage.web3Provider = new Web3.provider.HttpProvider("http://localhost:8545");
        }
        web3 = new Web3(MyPage.web3Provider);
        web3.eth.defaultAccount = web3.eth.accounts[0];

        return MyPage.initContract();
    },

    initContract: function() {
        $.getJSON("MarketNFT.json", function(MarketNFT) {
            MyPage.contracts.MarketNFT = TruffleContract(MarketNFT);
            MyPage.contracts.MarketNFT.setProvider(MyPage.web3Provider);
            return MyPage.initContract1();
        });
    },

    initContract1: function() {
        $.getJSON("DoBuyToken.json", function(DoBuyToken) {
            MyPage.contracts.DoBuyToken = TruffleContract(DoBuyToken);
            MyPage.contracts.DoBuyToken.setProvider(MyPage.web3Provider);
            return MyPage.render();
        });
    },

    render: function() {
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                MyPage.account = account;
            //   $("#accountAddress").html("Your Account: " + account);
            }
        });
        let MarketNFTInstance;
        MyPage.contracts.MarketNFT.deployed().then(function(instance) {
            MarketNFTInstance = instance;
            return MarketNFTInstance._tokenIds();
        }).then(async function(Ids) {
            let getLists = $('.getLists');;
            let temp;
            for(let i = 0; i <= Ids; i++) {
                let address1 = await MarketNFTInstance._DoBuyToOwner(i);
                if(address1 == web3.eth.accounts[0]){
                    let data = await MarketNFTInstance._DoBuylist(i);
                    temp = `
                        <div>
                            <div>${data[0]}</div>
                            <div>${data[2]}</div>
                            <img src="/images/${data[3]}" style="width:100px;height:100px"/>
                        </div>
                    `;
                    await getLists.append(temp);
                } else {
                    continue;
                }
                
            } 

        });
    }
};

$(function() {
    $(window).load(function() {
        MyPage.init();
    });
});