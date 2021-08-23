// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./SafeMath.sol";

contract DoBuyToken is ERC20 {
    // using Counters for Counters.Counter;
    // using SafeMath for uint256;

    // 현재 접속중인 지갑
    address public now_wallet = payable(msg.sender);

    address public owners;

    /// @notice 토큰 이름
    string public constant _token = "DoBuyToken";

    /// @notice 토큰 기호
    string public constant _symbol = "DBT";

    /// @notice 십진법
    uint8 public constant _decimals = 18;

    /// @notice 토큰 발행 개수
    uint256 public constant INITIAL_SUPPLY = 100000000;
    
    /// @notice 유저 지갑
    address public user_wallet = payable(msg.sender);

    /// @notice 운송장번호
    // Counters.Counter public _trackingIds;
    uint256 public _trackingIds;
    uint256 public dd;

    /// @dev 운송장 정보
    struct deliveryBill {
        uint256 _Ids;   // 운송장번호 - counter
        uint16 amount;
        string name;
        string sender;
        string receiver;
    }

    /// @dev 배송추적 정보 (한 행)
    /// 출발지: 금복빌딩 / 배송중: 김포, 곤지암, 이천, 광주Hub 중 랜덤 / 배송완료: 입력한 배송도착지
    struct deliveryTracking {
        uint256 timestamp;
        string location;    
        string status;  // 배송출발, 배송중, 배송완료
    }

    // /// @dev 배송추적 리스트 (매번 초기화)
    // deliveryTracking[] public trackinglist;

    string[4] public location = ["Gimpo", "Gonjiam", "Icheon", "Gwangju"];

    // 운송장 배열
    mapping (uint256 => deliveryBill) public billArray;

    // 배송추적 리스트 배열 : trackingId 로 매칭. deliveryTracking 구조체를 여러줄 담고 있는 trackingArray가 value
    mapping (uint256 => deliveryTracking[]) public trackingArray;

    constructor() ERC20("DoBuyToken", "DBT") {
        owners = payable(msg.sender);
        _mint(owners, INITIAL_SUPPLY * 10 ** _decimals);
    }
    
    /**
    * @dev 배송 선택 시. 수령자 이름, 상품 수량, 배송도착지 입력받아야 함.
    * @param _name 상품명
    * @param _receiver 구매자 이름
    * @param _amount 수량
     */
    function deliveryStart(string memory _name, string memory _receiver, uint16 _amount) public returns (uint256){
        // _trackingIds.increment();
        _trackingIds++;
        billArray[_trackingIds] = deliveryBill(_trackingIds, _amount, _name, "DoBuy Market", _receiver);
        trackingArray[_trackingIds].push(deliveryTracking(block.timestamp, "geumbok building", "Start Delivery"));
        return _trackingIds;
    }
    /**
    * @dev 배송 시작하면 setInterval로 시간 검사해서 작동할 함수.
    *      setInterval로 검사할 거 아니면 block.timestamp 검사해서 단계별로 찍히게 하기
    * @param _Ids 운송장번호(_trackingIds)
    */
    function deliveryUpdate(uint256 _Ids, string memory _dest) public {
        //가장 최근 trackinglist의 timestamp
        uint256 listlength = trackingArray[_Ids].length;
        uint256 lastTime = trackingArray[_Ids][listlength].timestamp;
        bool completed = false;
        uint256 userDeliveryNum = uint256(keccak256(abi.encodePacked(msg.sender))) % 4;
        if (lastTime + 1 hours <= block.timestamp && block.timestamp < lastTime + 2 hours) {
            trackingArray[_Ids].push(deliveryTracking(block.timestamp, location[userDeliveryNum], "Delivering"));
        } else if (lastTime + 2 hours <= block.timestamp && block.timestamp < lastTime + 3 hours) {
            trackingArray[_Ids].push(deliveryTracking(block.timestamp, location[(userDeliveryNum + 1) % 4], "Delivering"));
        } else if (lastTime + 3 hours <= block.timestamp) {
            trackingArray[_Ids].push(deliveryTracking(block.timestamp, _dest, "Delivery Completed"));
            completed = true;
        }
    }

    /**
     * @dev MarketNFT구매시 DoBuyToken 차감시키는 함수
     * @param _amounts 해당 금액이 들어온다
     */
    function getOwnerToken(uint256 _amounts) payable public {
        uint256 prices = _amounts * 10 ** (uint(decimals()));
        require(balanceOf(msg.sender) >= prices);
        transfer(owners, prices);
    }
}