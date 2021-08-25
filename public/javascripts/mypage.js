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
            let getLists = $('.getLists');
            let temp;
            for(let i = 0; i <= Ids; i++) {
                let address1 = await MarketNFTInstance._DoBuyToOwner(i);
                if(address1 == web3.eth.accounts[0]){
                    let data = await MarketNFTInstance._DoBuylist(i);
                    temp = `
                        <div class="mypage_card">
                            <div>${data[0]}</div>
                            <div>${data[2]}</div>
                            <img src="/images/${data[3]}" style="width:100px;height:100px"/>
                            <div class="nft_btn"><button class="btn_base deliver_btn" onclick="MyPage.reqDeliver(${data[0]}, '${data[2]}', '${data[3]}')">배송신청</button></div>
                        </div>
                    `;
                    await getLists.append(temp);
                } else {
                    continue;
                }
            }
        });
        let TokenInstance;
        MyPage.contracts.DoBuyToken.deployed().then(async function(instance){
            TokenInstance = instance;
            let billLength = Number(await TokenInstance._trackingIds());
            console.log(web3.eth.accounts[0]);
            let getTracking = $('.getTracking');
            let temp;
            for(let i = 0; i <= billLength; i++) {
                let address2 = await TokenInstance._billToOwner(i);
                if(address2 == web3.eth.accounts[0]) {
                    let bill = await TokenInstance._billArray(i);
                    console.log('배송추적 들어옴', Number(bill[0]));
                    temp = `
                        <div class="delivery_bill">
                            <p><span>운송장번호</span> ${bill[0]}</p>
                            <p><span>상품명</span> ${bill[2]}</p>
                            <p><span>발송인</span> ${bill[3]}</p>
                            <p><span>수령인</span> ${bill[4]}</p>
                            <button class="btn_base info_btn" onclick="MyPage.viewTracking(${bill[0]}, '${bill[5]}')">배송조회</button>
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
        let temp = `
            <div class="req_deliver">
                <div>${id}</div>
                <div>${name}</div>
                <img src="/images/${image_url}" style="width:100px;height:100px"/>
                <p><span>수령인</span><input id="receiver" type="text" value=""/></p>
                <p><span>배송지</span><input id="destination" type="text" value=""/></p>
                <button class="btn_base deliver_btn" onclick="MyPage.deliver(${id}, '${name}', $('#receiver').val(), $('#destination').val())">배송</button>
            </div>
        `
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
                //배송시작 - 운송장 발급, 배송추적 정보 생성
                await TokenInstance.deliveryStart(name, receiver, 1, destination);
                return await TokenInstance._trackingIds();      
            }).then(function(_trackingId) {
                console.log('trackingid', Number(_trackingId));
                return TokenInstance._billArray(Number(_trackingId));
            }).then(async function(bill) {
                let track = await TokenInstance._trackingArray(Number(bill[0]),0);
                //운송장, 배송 추적 정보
                let temp = `
                    <div class="delivery_bill">
                        <p><span>운송장번호</span> ${bill[0]}</p>
                        <p><span>상품명</span> ${bill[2]}</p>
                        <p><span>발송인</span> ${bill[3]}</p>
                        <p><span>수령인</span> ${bill[4]}</p>
                        <p><span>배송지</span> ${destination}</p>
                    </div>
                    <table class="tracking_info">
                        <thead>
                            <tr>
                                <th>단계</th>
                                <th>처리</th>
                                <th>담당 점소</th>
                            </tr>
                        </thead>
                        <tbody id="status_detail">
                            <tr>
                                <td>${track[2]}</td>
                                <td>${track[0]}</td>
                                <td>${track[1]}</td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="btn_base to_my_btn" onclick="location.href='/mypage'">마이페이지로</button>
                `
                let getLists = $(".getLists");
                await getLists.empty();
                await getLists.append(temp);
                // await TokenInstance.deliveryUpdate(Number(bill[0]), destination);
            })
        })
    },

    viewTracking: function(_trackingId, destination) {
        let TokenInstance;
        MyPage.contracts.DoBuyToken.deployed().then(async function(instance) {
            TokenInstance = instance;
            let bill = await TokenInstance._billArray(Number(_trackingId));
            let trackLength = await TokenInstance.getTrackingArrLength(Number(_trackingId));
            console.log("tracklength", Number(trackLength));
            // let track = [];
            //     track.push(await TokenInstance._trackingArray(Number(_trackingId), i));
            // await TokenInstance.deliveryUpdate(Number(_trackingId), destination);
            
            let getLists = $('.getLists');
            let getTracking = $('.getTracking');
            getLists.empty();
            getTracking.empty();

            let listTmp = `
                <div class="delivery_bill">
                    <p><span>운송장번호</span> ${bill[0]}</p>
                    <p><span>상품명</span> ${bill[2]}</p>
                    <p><span>발송인</span> ${bill[3]}</p>
                    <p><span>수령인</span> ${bill[4]}</p>
                </div>
            `;
            getLists.append(listTmp);
            let track = await TokenInstance._trackingArray(Number(_trackingId), 0);
            let trackTmp = `
                <table class="tracking_info">
                    <thead>
                        <tr>
                            <th>단계</th>
                            <th>처리</th>
                            <th>담당 점소</th>
                        </tr>
                    </thead>
                    <tbody id="status_detail">
                        <tr>
                            <td>${track[2]}</td>
                            <td>${track[0]}</td>
                            <td>${track[1]}</td>
                        </tr>
            `;
            for(let i = 1; i < trackLength; i++) {
                let track = await TokenInstance._trackingArray(Number(_trackingId), i);
                trackTmp = trackTmp + `
                        <tr>
                            <td>${track[2]}</td>
                            <td>${track[0]}</td>
                            <td>${track[1]}</td>
                        </tr>
                `;
            }
            await getTracking.append(trackTmp);
            return trackTmp;
        }).then(function() {
            let getTracking = $('.getTracking');
            let trackTmp = `
                        <button class="btn_base to_my_btn" onclick="location.href='/mypage'">마이페이지로</button>
                    </tbody>
                </table>
            `;
            getTracking.append(trackTmp);
        })
    }
};

$(function() {
    $(window).load(function() {
        MyPage.init();
    });
});