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
            MyPage.web3Provider = new Web3.provider.HttpProvider("https://ropsten.infura.io/v3/ae100d8463574c65aee0cef762d90cd0");
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

        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                MyPage.account = account;
                //   $("#accountAddress").html("Your Account: " + account);
            }
        });
        let getLists = $('.getLists');
        let getTracking = $('.getTracking');
        getLists.css("width", "42%");
        getTracking.css("width", "42%");
        let MarketNFTInstance;
        MyPage.contracts.MarketNFT.deployed().then(function(instance) {
            MarketNFTInstance = instance;
            return MarketNFTInstance._tokenIds();
        }).then(async function(Ids) {
            let temp;
            let flag = 0;
            await getLists.append("<h2>????????? ?????? NFT ??????</h2>")
            for(let i = 0; i <= Ids; i++) {
                let address1 = await MarketNFTInstance._DoBuyToOwner(i);
                if(address1 == web3.eth.accounts[0]){
                    let data = await MarketNFTInstance._DoBuylist(i);
                    if(data[4] == "market") {
                        temp = `
                            <div class="mypage_card_wrapper"">
                                <img src="/images/${data[3]}"/>
                                <div class="mypage_card"">
                                        <ul>
                                            <li><span>?????? ??????</span>  ${data[0]} </li>
                                            <li><span>?????? ??????</span>  ${MyPage.Unix_timestamp(data[1])}</li>
                                            <li><span>?????????</span>  ${data[2]} </li>
                                            <div class="nft_btn"><button class="btn_base deliver_btn" onclick="MyPage.reqDeliver(${data[0]}, '${data[2]}', '${data[3]}')">????????????</button></div>
                                        </ul>
                                </div>
                            </div>
                        `;
                        
                        await getLists.append(temp);
                    }
                    flag = 1;
                } else {
                    continue;
                }
            }
            if(flag == 0) await getLists.append("???????????? NFT??? ????????????.");
        });
        let TokenInstance;
        MyPage.contracts.DoBuyToken.deployed().then(async function(instance){
            TokenInstance = instance;
            let billLength = Number(await TokenInstance._trackingIds());
            let temp;
            await getTracking.append("<h2>??????????????????</h2>")
            for(let i = 0; i <= billLength; i++) {
                let address2 = await TokenInstance._billToOwner(i);
                if(address2 == web3.eth.accounts[0]) {
                    let bill = await TokenInstance._billArray(i);
                    temp = `
                        <div class="delivery_bill">
                            <p><span>???????????????</span> ${bill[0]}</p>
                            <p><span>?????????</span> ${bill[2]}</p>
                            <p><span>?????????</span> ${bill[3]}</p>
                            <p><span>?????????</span> ${bill[4]}</p>
                            <button class="btn_base info_btn" onclick="MyPage.viewTracking(${bill[0]})">????????????</button>
                            <hr/>
                        </div>
                    `;
                    await getTracking.append(temp);
                }
                else continue;
            }
            // return TokenInstance._billArray();
        });
    },

    reqDeliver: async function(id, name, image_url) {
        let getLists = $(".getLists");
        let getTracking = $(".getTracking");
        getLists.css("width", "94%");
        // getTracking.css("width", "94%");
        // let temp = `
        //     <div class="req_deliver">
        //         <div>${id}</div>
        //         <div>${name}</div>
        //         <img src="/images/${image_url}" style="width:100px;height:100px"/>
        //         <p><span>?????????</span><input id="receiver" type="text" value=""/></p>
        //         <p><span>?????????</span><input id="destination" type="text" value=""/></p>
        //         <button class="btn_base deliver_btn" onclick="MyPage.deliver(${id}, '${name}', $('#receiver').val(), $('#destination').val())">??????</button>
        //     </div>
        // `
        let temp = `
        <div class="deliver_product_info">
            <ul>    
                <li><span>?????? ??????</span>${id}</li>
                <li><span>?????????</span>${name}</li>
            </ul>
        </div>
        <div class="req_deliver">
            <img src="/images/${image_url}" style="width:600px;height:400px"/>
        </div>
        <div class="input_deliver_info">
                <ul>

                    <li><span>?????????</span><input id="receiver" type="text" value="" placeholder="???????????? ??????????????????."/></???>
                    <li><span>?????????</span><input id="destination" type="text" value="" placeholder="???????????? ??????????????????."/></>
                    <li><button class="btn_base deliver_btn" onclick="MyPage.deliver(${id}, '${name}', $('#receiver').val(), $('#destination').val())">??????</button></li>
                </ul>
        </div>
        `;
        await getLists.empty();
        await getTracking.empty();
        await getLists.append(temp);
    },

    deliver: function(nftId, name, receiver, destination) {
        let MarketNFTInstance;
        let TokenInstance;
        MyPage.contracts.MarketNFT.deployed().then(async function(instances) {
            MarketNFTInstance = instances;
            await MarketNFTInstance.burnNFT(nftId);
            await MyPage.contracts.DoBuyToken.deployed().then(async function(instance) {
                TokenInstance = instance;
                //???????????? - ????????? ??????, ???????????? ?????? ??????
                await TokenInstance.deliveryStart(name, receiver, 1, destination);
                return await TokenInstance._trackingIds();      
            }).then(function(_trackingId) {
                console.log('trackingid', Number(_trackingId));
                return TokenInstance._billArray(Number(_trackingId));
            }).then(async function(bill) {
                let track = await TokenInstance._trackingArray(Number(bill[0]),0);
                //?????????, ?????? ?????? ??????
                let temp = `
                    <div class="delivery_bill_view">
                        <table class="view_table bill_info">
                            <thead>
                                <tr>
                                    <th>???????????????</th>
                                    <th>?????????</th>
                                    <th>????????? ??????</th>
                                    <th>?????? ??????</th>
                                    <th>???????????????</th>
                                    <th>??????</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${bill[0]}</td>
                                    <td>${bill[2]}</td>
                                    <td>${bill[3]}</td>
                                    <td>${bill[4]}</td>
                                    <td>${destination}</td>
                                    <td>${bill[1]}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="delivery_tracking_view">
                        <table class="view_table tracking_info">
                            <thead>
                                <tr>
                                    <th>??????</th>
                                    <th>??????</th>
                                    <th>?????? ??????</th>
                                </tr>
                            </thead>
                            <tbody id="status_detail">
                                <tr>
                                    <td>${track[2]}</td>
                                    <td>${MyPage.Unix_timestamp(track[0])}</td>
                                    <td>${track[1]}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button class="btn_base to_my_btn" onclick="location.href='/mypage'">??????????????????</button>
                `
                let getLists = $(".getLists");
                await getLists.empty();
                await getLists.append(temp);
            })
        })
    },

    viewTracking: function(_trackingId) {
        const min = 60;
        let getLists = $('.getLists');
        let getTracking = $('.getTracking');
        getLists.css("width", "94%");
        getTracking.css("width", "94%");
        let TokenInstance;
        MyPage.contracts.DoBuyToken.deployed().then(async function(instance) {
            TokenInstance = instance;
            let bill = await TokenInstance._billArray(Number(_trackingId));
            let createdAt = await TokenInstance._trackingArray(Number(_trackingId), 0);
            let now = +new Date()/1000;
            createdAt = Number(createdAt[0]);
            
            var currentTrackLength = 1;
            if(createdAt + 5*min <= now && now < createdAt + 10*min) {
                currentTrackLength = 2;
            } else if (createdAt + 10*min <= now && now < createdAt + 15*min) {
                currentTrackLength = 3;
            } else if (createdAt + 15*min <= now) {
                currentTrackLength = 4;
            }

            getLists.empty();
            getTracking.empty();

            let listTmp = `
                <div class="delivery_bill_view">
                    <h2>?????? ??????</h2>
                    <table class="view_table bill_info">
                        <thead>
                            <tr>
                                <th>???????????????</th>
                                <th>?????????</th>
                                <th>????????? ??????</th>
                                <th>?????? ??????</th>
                                <th>??????</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${bill[0]}</td>
                                <td>${bill[2]}</td>
                                <td>${bill[3]}</td>
                                <td>${bill[4]}</td>
                                <td>${bill[1]}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            getLists.append(listTmp);
            let track = await TokenInstance._trackingArray(Number(_trackingId), 0);
            let trackTmp = `
                <div class="delivery_tracking_view">
                    <h2>?????? ?????? ??????</h2>
                    <table class="view_table tracking_info">
                        <thead>
                            <tr>
                                <th>??????</th>
                                <th>??????</th>
                                <th>?????? ??????</th>
                            </tr>
                        </thead>
                        <tbody id="status_detail">
                            <tr>
                                <td>${track[2]}</td>
                                <td>${MyPage.Unix_timestamp(track[0])}</td>
                                <td>${track[1]}</td>
                            </tr>
            `;
            for(let i = 1; i < currentTrackLength; i++) {
                track = await TokenInstance._trackingArray(Number(_trackingId), i);
                trackTmp = trackTmp + `
                            <tr>
                                <td>${track[2]}</td>
                                <td>${MyPage.Unix_timestamp(track[0])}</td>
                                <td>${track[1]}</td>
                            </tr>
                `;
            }
            await getTracking.append(trackTmp);
            return trackTmp;
        }).then(function() {
            let getTracking = $('.getTracking');
            let trackTmp = `
                            <button class="btn_base to_my_btn" onclick="location.href='/mypage'">??????????????????</button>
                        </tbody>
                    </table>
                </div>
            `;
            getTracking.append(trackTmp);
        })
    },

    Unix_timestamp: function(t){
        var date = new Date(t*1000);
        var year = date.getFullYear();
        var month = "0" + (date.getMonth()+1);
        var day = "0" + date.getDate();
        var hour = "0" + date.getHours();
        var minute = "0" + date.getMinutes();
        var second = "0" + date.getSeconds();
        return year + "-" + month.substr(-2) + "-" + day.substr(-2) + " " + hour.substr(-2) + ":" + minute.substr(-2) + ":" + second.substr(-2);
    }
};

$(function() {
    $(window).load(function() {
        MyPage.init();
    });

    setInterval(function() {
        // ????????? ??????????????? ??????
        if (web3.eth.accounts[0] !== MyPage.account) {
          location.reload();
        }
    }, 1000);
});