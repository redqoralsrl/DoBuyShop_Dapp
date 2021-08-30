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
            Market.web3Provider = new Web3.provider.HttpProvider("https://ropsten.infura.io/v3/ae100d8463574c65aee0cef762d90cd0");
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
            endPoint = proCounts - 10 > 0 ? proCounts - 10 : 0;
            for(let i = proCounts-1; i >= 0; i--){
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
                        <button class="admin_button" id="admin1" onclick="Market.clicks('plus');">NFT 추가</button>
                        <button class="admin_button" id="admin2" onclick="Market.clicks('change');">가격변동</button>
                        <button class="admin_button" id="admin3" onclick="Market.clicks('del');">NFT 삭제</button>
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
            }, function(err, result) {
                if(err) {
                    console.log(err);
                }else{
                    txn_hash = result;
                    MarketNFTInstance.buyMarket(_Ids, "market");
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
        }).then(function(res) {
            if(res) {
                console.log(res);
                MarketNFTInstance.buyMarket(_Ids, "market");
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
                <form action="/upload" method="post" enctype="multipart/form-data" id="fileForm" required>
                    <div>
                        ETH 가격 :
                        <input type="text" id="struct_eth" required>
                    </div>
                    <div>
                        DoBuy 토큰 가격 :
                        <input type="number" id="struct_dobuy" required>
                    </div>
                    <div>
                        물건 이름 :
                        <input type="text" id="struct_name" required>
                    </div>
                    <div class="filebox">
                        사진 :
                        <label for="fileInput">사진 선택</label>
                        <input type="file" name="fileInput" id="fileInput" accept=".gif, .jpg, .png" required/>
                    </div>
                    <input class="_submit" type="button" onclick="Market.upload()" value="등록">
                </form>
                </div>
            </div>
            `;
        } else if(datas == "change") {
            temp = `
                <div class="input_form">
                    <div class="market_name">
                        <div>
                            상품명 :
                            <input type="text" id="name_da" required>
                        </div>
                        <div>
                            이더리움 가격 변경 :
                            <input type="text" id="eths" required>
                        </div>
                        <div>
                            DoBuy토큰 가격 변경 :
                            <input type="text" id="dobuys" required>
                        </div>
                        <input class="_submit" type="button" onclick="Market.changePrice();" value="등록">
                    </div>
                </div>
            `;
        } else if(datas == "del") {
            temp = `
                <div class="input_form">
                    <div class="market_name">
                        <div>
                            상품명 :
                            <input type="text" id="name_pro" required>
                        </div>
                        <input class="_submit" type="button" onclick="Market.delProduct();" value="삭제">
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
        Market.contracts.MarketNFT.deployed().then(async function(instance) {
            MarketNFTInstance = instance;
            return await MarketNFTInstance.changePrice(name, eth_pri, Number(dobuy_pri));
        }).then(function() {
            location.reload();
        });
    },

    delProduct: function() {
        let names = $('#name_pro').val();
        let MarketNFTInstance;
        Market.contracts.MarketNFT.deployed().then(async function(instance) {
            MarketNFTInstance = instance;
            return await MarketNFTInstance.found(names);
        }).then(function() {
            location.reload();
        });
    },

    upload: function() {
        var form = $('#fileForm')[0];
        var formData = new FormData(form);

        var fileValue = $("#fileInput").val().split("\\");
        var fileName = fileValue[fileValue.length-1];
     
        $.ajax({
            type: 'post',
            url: '/upload',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                Market.plusNFT(fileName);
            },
            error: function (err) {
                console.log(err);
            }
        });
    },

    plusNFT: function(fileName) {
        let MarketNFTInstance;
        Market.contracts.MarketNFT.deployed().then(async function(instance) {
            MarketNFTInstance = instance;
            let et = $('#struct_eth').val();
            let dob = $('#struct_dobuy').val();
            let na = $('#struct_name').val();
            let picture = fileName;
            return await MarketNFTInstance.setMarketList(et, dob, na, picture);
        }).then(function() {
            location.reload();
        });
    }

};

$(function() {
    $(window).load(function() {
        Market.init();
    });

    setInterval(function() {
        // 계정이 바뀌었는지 확인
        if (web3.eth.accounts[0] !== Market.account) {
          location.reload();
        }
    }, 1000);
});