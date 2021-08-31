Swap = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return Swap.initWeb3();
    },

    initWeb3: async function() {
        if(window.ethereum) {
            Swap.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
                // await window.ethereum.eth_requestAccounts;
            } catch(error) {
                console.error("user denied account access");
            }
        } else if(window.web3) {
            Swap.web3Provider = window.web3.currentProvider;
        } else {
            Swap.web3Provider = new Web3.provider.HttpProvider("https://ropsten.infura.io/v3/ae100d8463574c65aee0cef762d90cd0");
        }
        web3 = new Web3(Swap.web3Provider);
        web3.eth.defaultAccount = web3.eth.accounts[0];
        // personal.unlockAccount(web3.eth.defaultAccount);
        
        return Swap.initContract();
    },

    initContract: function() {
        $.getJSON("DoBuyToken.json", function(DoBuyToken) {
            Swap.contracts.DoBuyToken = TruffleContract(DoBuyToken);
            Swap.contracts.DoBuyToken.setProvider(Swap.web3Provider);
            return Swap.render();
        });
    },

    render: function() {
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
              Swap.account = account;
            //   $("#accountAddress").html("Your Account: " + account);
            }
        });
            console.log();
            let trade = $(".swap_button");
            let temp = `
            <button class="swap_btn" onclick="Swap.buytoken()">Connect Wallet</button>
            `;
            trade.append(temp);
        // })
    },

    buytoken: async function(amounts) {
        // const getFloatFixed = (value, fixed) => {
        //     return parseFloat(Math.round(value * 100000) / 100000).toFixed(fixed);
        // };
        let sendETH = $(".swap_sendAmount").val();
        let TokenInstance;
        await Swap.contracts.DoBuyToken.deployed().then(function(instance) {
            TokenInstance = instance;
            return TokenInstance.owners();
        }).then(async function(owner_address) {
            await web3.eth.sendTransaction({
                from : web3.eth.accounts[0],
                to : owner_address,
                value: web3.toWei(sendETH,'ether'),
                gas: 21000,
            }, function(err,result) {
                if(err) {
                    console.log(err);
                }else{
                    txn_hash = result;
                    TokenInstance.buyingToken(web3.eth.accounts[0], sendETH * 2700).then(function() {
                        location.reload();
                    });
                }
            })
        });
    },
    ChangeDBT : function() {
        let sendDBT = $('.swap_sendAmount').val();
        let temp = Number(sendDBT) * 2700;
        $(".swap_receiveAmount").val(temp);
    }
    
};

$(function() {
    $(window).load(function() {
        Swap.init();
    });
});