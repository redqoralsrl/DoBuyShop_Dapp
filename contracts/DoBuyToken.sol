// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DoBuyToken is ERC20 {
    using Counters for Counters.Counter;

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
    Counters.Counter public _trackingIds;

    /// @dev 운송장 정보
    struct deliveryBill {
        uint256 _Ids;   // 운송장번호 - counter
        uint16 amount;
        string name;
        string sender;
        string receiver;
    }

    /// @dev 배송추적 정보
    /// 출발지: 금복빌딩 / 배송중: 김포, 곤지암, 이천, 광주Hub 중 랜덤 / 배송완료: 입력한 배송도착지
    struct deliveryTracking {
        uint256 timestamp;
        string location;    
        string status;  // 배송출발, 배송중, 배송완료
    }

    // 운송장 배열
    mapping (uint256 => deliveryBill) public billArray;

    // 배송추적 배열 : trackingId 로 매칭
    mapping (uint256 => deliveryTracking) public trackingArray;

    constructor() ERC20("DoBuyToken", "DBT") {
        address owners = msg.sender;
        _mint(owners, INITIAL_SUPPLY * 10 ** (uint(decimals())));
    }
    
    /**
    * @dev 배송 선택 시. 수령자 이름, 상품 수량, 배송도착지 입력받아야 함.
    * @param _name 상품명
    * @param _receiver 구매자 이름
    * @param _amount 수량
     */
    function deliveryStart(string memory _name, string memory _receiver, uint16 _amount) public {
        _trackingIds.increment();
        billArray[_trackingIds.current()] = 
            deliveryBill(_trackingIds.current(), _amount, _name, "DoBuy Market", _receiver);
        trackingArray[_trackingIds.current()] = 
            deliveryTracking(block.timestamp, "geumbok building", "Start Delivery");
    }
}