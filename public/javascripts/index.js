Index = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return Index.initWeb3();
    },

    initWeb3: async function() {
      // 모든 디앱 만들 때 아래 부분이 기본 형식
      // 이렇게 하면 메타마스크랑 연결됨
      // Modern dapp browser...
      if(window.ethereum) {
        // 이더리움 메인넷에 연결될 때 아래의 부분이 연결됨
        Index.web3Provider = window.ethereum;
        //이더리움이 있으면 프로바이더에 대입
        try{
        // Request account access
        await window.ethereum.enable();
        // await window.ethereum.eth_requestAccounts;
        }
        catch (error) {
        // user denied account access
        console.error("user denied account access");
        }
        }
        // Legacy dapp browser....
        else if(window.web3) {
          Index.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
          Index.web3Provider = new Web3.provider.HttpProvider('https://ropsten.infura.io/v3/ae100d8463574c65aee0cef762d90cd0');
        }
        web3 = new Web3(Index.web3Provider);
        // web3.eth.defaultAccount=web3.eth.accounts[0];
      // if (typeof web3 !== 'undefined') {
      //       // If a web3 instance is already provided by Meta Mask.
      //       Index.web3Provider = web3.currentProvider;
      //       web3 = new Web3(web3.currentProvider);
      //   } else {
      //       Index.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      //       web3 = new Web3(Index.web3Provider);
      //   }
        return Index.initContract();
    },

    initContract: function() {
        $.getJSON("DoBuyNFT.json", function(DoBuyNFT) {
            Index.contracts.DoBuyNFT = TruffleContract(DoBuyNFT);
            Index.contracts.DoBuyNFT.setProvider(Index.web3Provider);

            return Index.initContract1();
        });
        
    },

    initContract1: function() {
        $.getJSON("DoBuyToken.json", function(DoBuyToken) {
            Index.contracts.DoBuyToken = TruffleContract(DoBuyToken);
            Index.contracts.DoBuyToken.setProvider(Index.web3Provider);

            return Index.render();
        });
    },

    render: function() {
        let DoBuyTokenInstance;
        let DoBuyNFTInstance;

        web3.eth.getCoinbase(function(err, account) {
            if(err === null) {
                Index.account = account;
                $("#accountAddress").html("Account : " + account);
            }
        });

        // Index.contracts.DoBuyNFT.deployed().then(function(instance) {
        //     DoBuyNFTInstance = instance;
        //     return DoBuyNFTInstance._DoBuylist(0);
        // }).then(function(DoBuylist) {
        //     let NFTcards = $("#nftcards");
        //     NFTcards.empty();

        //     let _Ids = DoBuylist[0];
        //     let timestamp = DoBuylist[1];
        //     let name = DoBuylist[2];
        //     let image_url = DoBuylist[3];

        //     let temp = "<div>" + _Ids + "<img src=/images/" + image_url + ">" + timestamp + name + "</div>";
        //     NFTcards.append(temp);
        // }).catch(function(error) {
        //     console.warn(error);
        // });
    },
};

$(function() {
    $(window).load(function() {
        Index.init();
    });

    setInterval(function() {
        // 계정이 바뀌었는지 확인
        if (web3.eth.accounts[0] !== Index.account) {
          location.reload();
        }
    }, 1000);
});