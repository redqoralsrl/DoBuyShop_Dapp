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
            Trade.web3Provider = new Web3.provider.HttpProvider("http://localhost:8545");
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
            let content = $(".tag_body");
            content.empty();
            for(let i = 1; i <= countTotal; i++) {
                await MarketNFTInstance._DoBuyToOwner(i).then(async function(address) {
                    if(address == Trade.account) {
                        await MarketNFTInstance._DoBuylist(i).then(function(NFTcard) {
                            if(NFTcard[4] == "user") {
                                let temp = `
                                <div class="content_box">
                                    <div class="content_number">NFT ${NFTcard[0]}</div>
                                    <img class="content_img" src="/images/${NFTcard[3]}">
                                    <div class="content_name">${NFTcard[2]}</div>
                                    <button class="content_btn">NFT 판매하기</button>
                                    <!-- _selling 참고하기 -->
                                </div>
                                `;
                                content.append(temp);
                            }
                        });
                    }
                });
            }
        });
    },

    clicks: function(datas) {
        let forms = $(".plus_box");
        let temp = '';
        forms.empty();
        if(datas == "plus") {
            temp = `
                <div class="form_data">
                    <form action="/upload" method="post" enctype="multipart/form-data" id="fileForm" required>
                        <div>
                            물건 이름 :
                            <input type="text" id="struct_name" required>
                        </div>
                        <div>
                            사진 :
                            <input type="file" name="fileInput" id="fileInput" accept=".gif, .jpg, .png" required/>
                        </div>
                        <input type="button" onclick="Trade.upload()" value="등록">
                    </form>
                </div>
            `;
            forms.append(temp);
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
                Trade.madeNFT(fileName);
            },
            error: function (err) {
                console.log(err);
            }
        });
    },

    madeNFT: function(fileName) {
        let MarketNFTInstance;
        Trade.contracts.MarketNFT.deployed().then(function(instance) {
            MarketNFTInstance = instance;
            let na = $('#struct_name').val();
            let picture = fileName;
            MarketNFTInstance.mint(na, picture, "user");
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
