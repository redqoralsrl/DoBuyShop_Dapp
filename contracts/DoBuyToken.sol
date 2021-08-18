// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DoBuyToken is ERC20 {

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

    constructor() ERC20("DoBuyToken", "DBT") {
        address owners = msg.sender;
        _mint(owners, INITIAL_SUPPLY * 10 ** (uint(decimals())));
    }
}