Trade = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return Trade.initWeb3();
    },

    initWeb3: async function() {
        if(window.ethereum) {
            Trade.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
                // await window.ethereum.eth_requestAccounts;
            } catch(error) {
                console.error("user denied account access");
            }
        } else if(window.web3) {
            Trade.web3Provider = window.web3.currentProvider;
        } else {
            Trade.web3Provider = new Web3.provider.HttpProvider("https://ropsten.infura.io/v3/ae100d8463574c65aee0cef762d90cd0");
        }
        web3 = new Web3(Trade.web3Provider);
        web3.eth.defaultAccount = web3.eth.accounts[0];
        // personal.unlockAccount(web3.eth.defaultAccount);
        
        return Trade.initContract();        
    },

    initContract: function() {
        $.getJSON("MarketNFT.json", function(MarketNFT) {
            Trade.contracts.MarketNFT = TruffleContract(MarketNFT);
            Trade.contracts.MarketNFT.setProvider(Trade.web3Provider);
            return Trade.initContract1();
        });
    },

    initContract1: function() {
        $.getJSON("DoBuyToken.json", function(DoBuyToken) {
            Trade.contracts.DoBuyToken = TruffleContract(DoBuyToken);
            Trade.contracts.DoBuyToken.setProvider(Trade.web3Provider);
            return Trade.render();
        });
    },

    render: function() {
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                Trade.account = account;
            //   $("#accountAddress").html("Your Account: " + account);
            }
        });
        let MarketNFTInstance;
        let DoBuyTokenInstance;
        Trade.contracts.MarketNFT.deployed().then(function(instance) {
            MarketNFTInstance = instance;
            return MarketNFTInstance._tokenIds();
        }).then(async function(counts) {
            let countTotal = Number(counts);
            let tag_body = $(".tag_body");
            let content = $(".content");
            await tag_body.empty();
            for(let i = 1; i <= countTotal; i++) {
                await MarketNFTInstance._DoBuylist(i).then(async function(NFTcard) {
                    if(NFTcard[4] == "user") {
                        let isSelling = await MarketNFTInstance._selling(Number(NFTcard[0]));
                        await MarketNFTInstance._DoBuyToOwner(i).then(async function(address) {
                            if(address == Trade.account) {
                                let temp = `
                                    <div class="content_box">
                                        <div class="content_number">NFT ${NFTcard[0]}</div>
                                        <img class="content_img" src="/images/${NFTcard[3]}">
                                        <div class="content_name">${NFTcard[2]}</div>`;
                                        if(isSelling == true) {
                                            temp = temp + `<button class="content_btn disabled" onclick="Trade.clicks('cancel', ${NFTcard[0]})">판매취소</button>`;
                                        } else {
                                            temp = temp + `<button class="content_btn" onclick="Trade.clicks('sell', ${NFTcard[0]})">NFT 판매하기</button>`;
                                        }
                                temp = temp + `</div>`;
                                tag_body.append(temp);
                            }

                            if(await MarketNFTInstance._selling(Number(NFTcard[0])) == true && address != Trade.account) {
                                let sellingproduct = await MarketNFTInstance.TradeSell(Number(NFTcard[0]));
                                let tmp = `
                                    <div class="content_box selling_nft">
                                        <div class="content_number">NFT ${NFTcard[0]}</div>
                                        <img class="content_img" src="/images/${NFTcard[3]}">
                                        <div class="content_name">${NFTcard[2]}</div>
                                        <div class="content_eth"><input type="text" value="${sellingproduct[0]}" disabled/><img src="/images/eth.svg" /></div>
                                        <div class="content_be"><button class="eth_btn" onclick="Trade.buyIt('eth',${NFTcard[0]},${sellingproduct[0]})">Buy</button></div>
                                        <div class="content_do"><input type="number" value="${sellingproduct[1]}" disabled/><img src="/images/db.svg" /></div>
                                        <div class="content_bd"><button class="do_btn" onclick="Trade.buyIt('dobuy',${NFTcard[0]},${sellingproduct[1]})">Buy</button></div>
                                    </div>
                                `;
                                content.append(tmp);
                            }
                        });
                    }
                });
            }
        });
    },

    clicks: function(datas, nftid) {
        let form1 = $(".plus_box");
        let form2 = $(".sell_box");
        let temp = '';
        form1.empty();
        if(datas == "plus") {
            temp = `
                <div class="form_data">
                    <form action="/upload" method="post" enctype="multipart/form-data" id="fileForm" required>
                        <div>
                            상품명 :
                            <input type="text" id="struct_name" placeholder='상품명을 입력해주세요' required>
                        </div>
                        <div class="filebox">
                            이미지 업로드 :
                            <label for="fileInput">사진 선택</label>
                            <input type="file" name="fileInput" id="fileInput" accept=".gif, .jpg, .png" required/>
                        </div>
                        <div class="plus_btn">
                            <input type="button" onclick="Trade.upload()" value="등록" class="input_submit">
                        </div>
                    </form>
                </div>
            `;
            form1.append(temp);
        }
        if(datas == "sell") {
            temp = `
            <div class="form_data">
                    <div>
                        Ethereum Price :
                        <input type="text" id="eths" required/>
                    </div>
                    <div>
                        DobuyToken Price :
                        <input type="text" id="dobuys" required/>
                    </div>
                    <input class="sell_btn" type="button" onclick="Trade.sellNFT(${nftid})" value="등록">
            </div>
            `;
            form2.append(temp);
        }
        if(datas == "cancel") {
            let MarketNFTInstance;
            Trade.contracts.MarketNFT.deployed().then(async function(instance) {
                MarketNFTInstance = instance;
                return await MarketNFTInstance.cancelTrade(nftid);
            }).then(function() {
                location.reload();
            });
        }
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
                Trade.makeNFT(fileName);
            },
            error: function (err) {
                console.log(err);
            }
        });
    },

    makeNFT: function(fileName) {
        let MarketNFTInstance;
        Trade.contracts.MarketNFT.deployed().then(async function(instance) {
            MarketNFTInstance = instance;
            let na = $('#struct_name').val();
            let picture = fileName;
            if(na != "" && picture != "") {
                await MarketNFTInstance.mint(na, picture, "user").then(function() {
                    location.reload();
                });
            } else if (na == "") {
                alert("이름을 입력해주세요.");
            } else if (picture == "") {
                alert("사진을 등록해주세요.");
            }
        })
    },

    sellNFT: function(nftid) {
        let eth_price = $('#eths').val();
        let dobuy_price = $('#dobuys').val();
        console.log('eth, dobuy price', eth_price, Number(dobuy_price));
        let MarketNFTInstance;
        Trade.contracts.MarketNFT.deployed().then(async function(instance) {
            MarketNFTInstance = instance;
            return await MarketNFTInstance.sellTrade(nftid, eth_price, Number(dobuy_price));
        }).then(function() {
            location.reload();
        });
    },

    buyIt: async function(token, _Ids, price) {
        if(token == "eth"){
            await Trade.ethBuy(token, _Ids, price);
        }else if (token == "dobuy"){
            await Trade.dobuyBuy(token, _Ids, price);
        }
    },

    ethBuy: async function(token, _Ids, price) {
        let TokenInstance;
        let MarketNFTInstance;
        await Trade.contracts.DoBuyToken.deployed().then(function(instance) {
            TokenInstance = instance;
            return Trade.contracts.MarketNFT.deployed();
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
                console.log('들어옴');
                if(err) {
                    console.log(err);
                }else{
                    console.log("고유번호", _Ids);
                    txn_hash = result;
                    MarketNFTInstance.buyUser(_Ids).then(function() {
                        location.reload();
                    });
                }
            });
        })
    },

    dobuyBuy: async function(token, _Ids, price) {
        let TokenInstance;
        let MarketNFTInstance;
        await Trade.contracts.DoBuyToken.deployed().then(function(instance) {
            TokenInstance = instance;
            return Trade.contracts.MarketNFT.deployed();
        }).then(function(instance1) {
            MarketNFTInstance = instance1;
            return TokenInstance.getOwnerToken(price);
        }).then(async function(res) {
            if(res) {
                console.log(res);
                return await MarketNFTInstance.buyUser(_Ids);
            }
        }).then(function() {
            location.reload();
        });
    },

};

$(function() {
    $(window).load(function() {
        Trade.init();
    });

    setInterval(function() {
        // 계정이 바뀌었는지 확인
        if (web3.eth.accounts[0] !== Trade.account) {
            location.reload();
        }
    }, 1000);
})
