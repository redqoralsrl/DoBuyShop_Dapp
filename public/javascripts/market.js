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
                // await window.ethereum.eth_requestAccounts;
            } catch(error) {
                console.error("user denied account access");
            }
        } else if(window.web3) {
            Market.web3Provider = window.web3.currentProvider;
        } else {
            Market.web3Provider = new Web3.provider.HttpProvider("http://localhost:8545");
        }
        web3 = new Web3(Market.web3Provider);
        web3.eth.defaultAccount = web3.eth.accounts[0];
        // personal.unlockAccount(web3.eth.defaultAccount);
        
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
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
              Market.account = account;
            //   $("#accountAddress").html("Your Account: " + account);
            }
        });
        let MarketNFTInstance;
        Market.contracts.MarketNFT.deployed().then(function(instance) {
            MarketNFTInstance = instance;
            return MarketNFTInstance._MarketIds();
        }).then(async function(counts) {
            let content = $(".content");
            content.empty();
            for(let i = 1; i <= counts; i++) {
                await MarketNFTInstance._MarketList(i).then(function(product) {
                    if(product[1] != ""){
                        let temp = `
                        <div class="content_box">
                            <img class="content_img" src="/images/${product[4]}">
                            <div class="content_name">${product[3]}</div>
                            <div class="content_eth"><input type="text" value="${product[1]}" disabled/><img src="/images/eth.svg" /></div>
                            <div class="content_be"><button class="eth_btn" onclick="Market.buyIt('eth',${product[0]},${product[1]})">Buy</button></div>
                            <div class="content_do"><input type="number" value="${product[2]}" disabled/><img src="/images/db.svg" /></div>
                            <div class="content_bd"><button class="do_btn" onclick="Market.buyIt('dobuy',${product[0]},${product[2]})">Buy</button></div>
                        </div>
                        `;
                        content.append(temp);
                    }
                }).catch(function(error) {
                    console.warn(error);
                });
            }
            return MarketNFTInstance.ProductCounts();
        }).then(async function(proCounts) {
            let box = $(".list_body");
            box.empty();
            for(let i = 0; i < proCounts; i++){
                await MarketNFTInstance.ProductBuy(i).then(function(list) {
                    let temp = `
                        <div class="list_box_show">
                        <div class="list_data">${list[0]}</div><div class="list_data2">${list[1]}</div>
                        </div>
                    `;
                    box.append(temp);
                }).catch(function(error) {
                    console.warn(error);
                });
            }
            await Market.contracts.DoBuyToken.deployed().then(function(instance) {
                let TokenInstance = instance
                return TokenInstance.owners();
            }).then(function(own_addresss) {
                if(own_addresss == Market.account) {
                    let adm = $('.admins_btn');
                    let temp = `
                        <button class="admin_button" onclick="Market.clicks('plus');">NFT 추가</button>
                        <button class="admin_button2" onclick="Market.clicks('change');">가격변동</button>
                        <button class="admin_button3" onclick="Market.clicks('del');">NFT 삭제</button>
                    `;
                    adm.append(temp);
                }
            })
        })
    },

    buyIt: async function(token, _Ids, price) {
        if(token == "eth"){
            await Market.ethBuy(token, _Ids, price);
        }else if (token == "dobuy"){
            await Market.dobuyBuy(token, _Ids, price);
        }
    },

    ethBuy: async function(token, _Ids, price) {
        let TokenInstance;
        let MarketNFTInstance;
        await Market.contracts.DoBuyToken.deployed().then(function(instance) {
            TokenInstance = instance;
            return Market.contracts.MarketNFT.deployed();
        }).then(function(instance1) {
            MarketNFTInstance = instance1;
            
            return TokenInstance.owners();
        }).then(async function(owner_address) {
            let txn_hash;
            await web3.eth.sendTransaction({
                from: web3.eth.accounts[0],
                to: owner_address,
                // "value": web3.utils.toWei(`${price}`,'ether')
                value: web3.toWei(price,'ether'),
                gas: 21000,
            }, async function(err, result) {
                if(err) {
                    console.log(err);
                }else{
                    txn_hash = result;
                    await MarketNFTInstance.buyMarket(_Ids);
                    await Market.init();
                }
            })
        });
    },

    dobuyBuy: async function(token, _Ids, price) {
        let TokenInstance;
        let MarketNFTInstance;
        await Market.contracts.DoBuyToken.deployed().then(function(instance) {
            TokenInstance = instance;
            return Market.contracts.MarketNFT.deployed();
        }).then(function(instance1) {
            MarketNFTInstance = instance1;
            return TokenInstance.getOwnerToken(price);
        }).then(async function(res) {
            if(res) {
                console.log(res);
                await MarketNFTInstance.buyMarket(_Ids);
                await Market.init();
            }
        });
    },

    clicks: function(datas) {
        let forms = $(".form_data");
        let temp = '';
        forms.empty();
        if(datas == "plus"){
            temp = `
            <div class="input_form">
                <div class="market_name">
                <form action="/upload" method="post" enctype="multipart/form-data" id="fileForm">
                    <div>
                        ETH 가격 :
                        <input type="text" id="struct_eth">
                    </div>
                    <div>
                        DoBuy 토큰 가격 :
                        <input type="number" id="struct_dobuy">
                    </div>
                    <div>
                        물건 이름 :
                        <input type="text" id="struct_name">
                    </div>
                    <div>
                        사진 :
                        <input type="file" name="fileInput" id="fileInput" accept=".gif, .jpg, .png"/>
                    </div>
                    <input type="button" onclick="Market.upload()" value="등록">
                </form>
                </div>
            </div>
            `;
        } else if(datas == "change") {
            temp = `
                <div class="input_form">
                    <div class="market_name">
                        <div>
                            Goods on sale :
                            <input type="text" id="name_da">
                        </div>
                        <div>
                            Ethereum Price Change :
                            <input type="text" id="eths">
                        </div>
                        <div>
                            DoBuyToken Price Change :
                            <input type="text" id="dobuys">
                        </div>
                        <input type="button" onclick="Market.changePrice();" value="등록">
                    </div>
                </div>
            `;
        } else if(datas == "del") {
            temp = `
                <div class="input_form">
                    <div class="market_name">
                        <div>
                            Goods on sale :
                            <input type="text" id="name_pro">
                        </div>
                        <input type="button" onclick="Market.delProduct();" value="삭제">
                    </div>
                </div>
            `;
        }
        
        forms.append(temp);
    },

    changePrice: function() {
        let name = $('#name_da').val();
        let eth_pri = $('#eths').val();
        let dobuy_pri = $('#dobuys').val();
        let MarketNFTInstance;
        Market.contracts.MarketNFT.deployed().then(function(instance) {
            MarketNFTInstance = instance;
            return MarketNFTInstance.changePrice(name, eth_pri, Number(dobuy_pri));
        }).then(function() {
            Market.init();
        });
    },

    delProduct: function() {
        let names = $('#name_pro').val();
        let MarketNFTInstance;
        Market.contracts.MarketNFT.deployed().then(function(instance) {
            MarketNFTInstance = instance;
            return MarketNFTInstance.found(names);
        })
    },

    upload: function() {
        var form = $('#fileForm')[0];
        var formData = new FormData(form);
     
        $.ajax({
            type: 'post',
            url: '/upload',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                // $('#filePath').val(data);
                location.reload();
            },
            error: function (err) {
                console.log(err);
            }
        });
    },

};

$(function() {
    $(window).load(function() {
        Market.init();
    });
});