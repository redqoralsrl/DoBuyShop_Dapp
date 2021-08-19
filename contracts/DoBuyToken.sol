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
        uint256 _Ids;   //trackingId
        uint16 amount;
        string sender;
        string receiver;
        string name;
    }

    constructor() ERC20("DoBuyToken", "DBT") {
        address owners = msg.sender;
        _mint(owners, INITIAL_SUPPLY * 10 ** (uint(decimals())));
    }
    
    /// @dev delivery - 배송 시작
    function deliveryStart(uint256 NFT) public {
        _trackingIds.increment();
    }
}