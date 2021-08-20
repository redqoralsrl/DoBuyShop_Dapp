Market = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return Market.initWeb3();
    },

    initWeb3: async function() {
        if(window.ethereum) {
            Market.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch(error) {
                console.error("user denied account access");
            }
        } else if(window.web3) {
            Market.web3Provider = window.web3.currentProvider;
        } else {
            Market.web3Provider = new Web3.provider.HttpProvider("http://localhost:8545");
        }
        web3 = new Web3(Market.web3Provider);

        return Market.initContract();
    },

    initContract: function() {
        $.getJSON("MarketNFT.json", function(MarketNFT) {
            Market.contracts.MarketNFT = TruffleContract(MarketNFT);
            Market.contracts.MarketNFT.setProvider(Market.web3Provider);
            return Market.initContract1();
        });
    },

    initContract1: function() {
        $.getJSON("DoBuyToken.json", function(DoBuyToken) {
            Market.contracts.DoBuyToken = TruffleContract(DoBuyToken);
            Market.contracts.DoBuyToken.setProvider(Market.web3Provider);
            return Market.render();
        });
    },

    render: function() {
        let MarketNFTInstance;
        Market.contracts.MarketNFT.deployed().then(function(instance) {
            MarketNFTInstance = instance;
            return MarketNFTInstance._MarketIds();
        }).then(function(counts) {
            let content = $(".content");
            content.empty();
            for(let i = 1; i <= counts; i++) {
                MarketNFTInstance._MarketList(i).then(function(product) {
                    let temp = `
                    <div class="content_box">
                        <img class="content_img" src="/images/${product[4]}">
                        <div class="content_name">${product[3]}</div>
                        <div class="content_eth"><input type="number" value="${product[1]}" disabled/><img src="/images/eth.svg" /></div>
                        <div class="content_be"><button class="eth_btn" onclick="()=>Market.buyIt('eth',${product[0]})">Buy</button></div>
                        <div class="content_do"><input type="number" value="${product[2]}" disabled/><img src="/images/db.svg" /></div>
                        <div class="content_bd"><button class="do_btn" onclick="()=>Market.buyIt('dobuy',${product[0]})">Buy</button></div>
                    </div>
                    `;
                    content.append(temp);
                }).catch(function(error) {
                    console.warn(error);
                });
            }
        })
    },

    buyIt: async function(token, _Ids) {
        let TokenInstance;
        let MarketNFTInstance;
        Market.contracts.DoBuyToken.deployed().then(function(instance) {
            TokenInstance = instance;
            Market.contracts.MarketNFT.deployed().then(function(instance1) {
                MarketNFTInstance = instance1;
                if(token == "eth"){
    
                }else if(token == "dobuy") {
                
                }
            });
        });
        
        
    }

};

$(function() {
    $(window).load(function() {
        Market.init();
    });
});