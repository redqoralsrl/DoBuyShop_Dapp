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

    render: async function() {

        MyPage.contracts.DoBuyToken.deployed().then(async function(instance){
            let TT = instance;
            return TT.dd();
        }).then(async function(a){
            console.log(Number(a));
        })

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
                            <div class="nft_btn"><button class="deliver_btn" onclick="MyPage.reqDeliver(${data[0]}, '${data[2]}', '${data[3]}')">Request Delivery</button></div>
                        </div>
                    `;
                    await getLists.append(temp);
                } else {
                    continue;
                }
            }
            // return MyPage.render1(); 
        });
    },

    // render1: function() {
    //     let DoBuyTokenInstance;
    //     MyPage.contracts.DobuyToken.deployed().then(function(instance) {
    //         DoBuyTokenInstance = instance;
    //         return DoBuyTokenInstance._trackingIds();
    //     })
    // },

    reqDeliver: async function(id, name, image_url) {
        let getLists = $(".getLists")
        let temp = `
            <div>
                <div>${id}</div>
                <div>${name}</div>
                <img src="/images/${image_url}" style="width:100px;height:100px"/>
                <div>수령인<input id="receiver" type="text" value=""/></div>
                <div>배송지<input id="destination" type="text" value=""/></div>
                <button class="deliver_btn" onclick="MyPage.deliver(${id}, '${name}', $('#receiver').val(), $('#destination').val())">Deliver</button>
            </div>
        `
        await getLists.empty();
        await getLists.append(temp);
    },

    // deliver: async function(nftId, name, receiver, destination){
    //     let MarketNFTInstance;
    //     MyPage.contracts.MarketNFT.deployed().then(function(instance) {
    //         MarketNFTInstance = instance;
    //     }).then(async function() {
    //         //NFT 삭제 (use nftId)
    //         await MarketNFTInstance.burnNFT(nftId);
    //         let TokenInstance;
    //         await MyPage.contracts.DoBuyToken.deployed().then(function(instance) {
    //             TokenInstance = instance;
    //         }).then(async function() {
    //             //운송장 발급
    //             // return TokenInstance.deliveryStart(name, receiver, 1);
    //             return await TokenInstance.deliveryStart(name, receiver, 1);
    //             // console.log(TokenInstance.trackingArray[0]);
    //         }).then(async function(_trackingId) {
    //             console.log('111111111111',_trackingId);
    //             // let _trackingIdss = await TokenInstance._trackingIds();
    //             //운송장 보여주기
    //             // let tt = await TokenInstance._trackingIds();
    //             // console.log('22222222222', tt);
    //             // return await TokenInstance.billArray(tt);
    //             return await TokenInstance.billArray(_trackingId);
    //         }).then(function(track) {
    //             console.log(track);
    //             let temp = `
    //                 <div>
    //                     <div>운송장번호: ${track._Ids()}</div>
    //                     <div>상품명: ${track.name()}</div>
    //                     <div>발송인: ${track.sender()}</div>
    //                     <div>수령인: ${track.receiver()}</div>
    //                     <div>배송지: ${destination}</div>
    //                 </div>
    //             `
    //             let getLists = $(".getLists");
    //             getLists.empty();
    //             getLists.append(temp);
    //         })
    //     })
    // }
    deliver: function(nftId, name, receiver, destination) {
        let MarketNFTInstance;
        let TokenInstance;
        MyPage.contracts.MarketNFT.deployed().then(async function(instance) {
            MarketNFTInstance = instance;
            await MarketNFTInstance.burnNFT(nftId);
            await MyPage.contracts.DoBuyToken.deployed().then(async function(instances) {
                TokenInstance = instances;
                await TokenInstance.deliveryStart(name, receiver, 1);
                return await TokenInstance._trackingIds();
            }).then(async function(_trackingId) {
                console.log('trackingid', Number(_trackingId));
                return TokenInstance.billArray(Number(_trackingId));
            }).then(function(track) {
                let temp = `
                    <div>
                        <div>운송장번호: ${track[0]}</div>
                        <div>상품명: ${track[2]}</div>
                        <div>발송인: ${track[3]}</div>
                        <div>수령인: ${track[4]}</div>
                        <div>배송지: ${destination}</div>
                    </div>
                `
                let getLists = $(".getLists");
                getLists.empty();
                getLists.append(temp);
            })
        })
    }
};

$(function() {
    $(window).load(function() {
        MyPage.init();
    });
});