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
            await getLists.append("<h2>보유한 마켓 NFT 목록</h2>")
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
                                            <li><span>주문 번호</span>  ${data[0]} </li>
                                            <li><span>구매 시간</span>  ${MyPage.Unix_timestamp(data[1])}</li>
                                            <li><span>상품명</span>  ${data[2]} </li>
                                            <div class="nft_btn"><button class="btn_base deliver_btn" onclick="MyPage.reqDeliver(${data[0]}, '${data[2]}', '${data[3]}')">배송신청</button></div>
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
            if(flag == 0) await getLists.append("보유중인 NFT가 없습니다.");
        });
        let TokenInstance;
        MyPage.contracts.DoBuyToken.deployed().then(async function(instance){
            TokenInstance = instance;
            let billLength = Number(await TokenInstance._trackingIds());
            let temp;
            await getTracking.append("<h2>배송신청내역</h2>")
            for(let i = 0; i <= billLength; i++) {
                let address2 = await TokenInstance._billToOwner(i);
                if(address2 == web3.eth.accounts[0]) {
                    let bill = await TokenInstance._billArray(i);
                    temp = `
                        <div class="delivery_bill">
                            <p><span>운송장번호</span> ${bill[0]}</p>
                            <p><span>상품명</span> ${bill[2]}</p>
                            <p><span>발송인</span> ${bill[3]}</p>
                            <p><span>수령인</span> ${bill[4]}</p>
                            <button class="btn_base info_btn" onclick="MyPage.viewTracking(${bill[0]})">배송조회</button>
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
        //         <p><span>수령인</span><input id="receiver" type="text" value=""/></p>
        //         <p><span>배송지</span><input id="destination" type="text" value=""/></p>
        //         <button class="btn_base deliver_btn" onclick="MyPage.deliver(${id}, '${name}', $('#receiver').val(), $('#destination').val())">배송</button>
        //     </div>
        // `
        let temp = `
        <div class="deliver_product_info">
            <ul>    
                <li><span>주문 번호</span>${id}</li>
                <li><span>상품명</span>${name}</li>
            </ul>
        </div>
        <div class="req_deliver">
            <img src="/images/${image_url}" style="width:600px;height:400px"/>
        </div>
        <div class="input_deliver_info">
                <ul>

                    <li><span>수령인</span><input id="receiver" type="text" value="" placeholder="수령인을 입력해주세요."/></ㅣ>
                    <li><span>배송지</span><input id="destination" type="text" value="" placeholder="배송지를 입력해주세요."/></>
                    <li><button class="btn_base deliver_btn" onclick="MyPage.deliver(${id}, '${name}', $('#receiver').val(), $('#destination').val())">배송</button></li>
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
                    <div class="delivery_bill_view">
                        <table class="view_table bill_info">
                            <thead>
                                <tr>
                                    <th>운송장번호</th>
                                    <th>상품명</th>
                                    <th>보내는 사람</th>
                                    <th>받는 사람</th>
                                    <th>배송예정지</th>
                                    <th>수량</th>
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
                                    <th>단계</th>
                                    <th>처리</th>
                                    <th>담당 점소</th>
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
                    <button class="btn_base to_my_btn" onclick="location.href='/mypage'">마이페이지로</button>
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
                    <h2>조회 결과</h2>
                    <table class="view_table bill_info">
                        <thead>
                            <tr>
                                <th>운송장번호</th>
                                <th>상품명</th>
                                <th>보내는 사람</th>
                                <th>받는 사람</th>
                                <th>수량</th>
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
                    <h2>상품 상태 확인</h2>
                    <table class="view_table tracking_info">
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
                            <button class="btn_base to_my_btn" onclick="location.href='/mypage'">마이페이지로</button>
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
        // 계정이 바뀌었는지 확인
        if (web3.eth.accounts[0] !== MyPage.account) {
          location.reload();
        }
    }, 1000);
});