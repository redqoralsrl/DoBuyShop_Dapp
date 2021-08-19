// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DoBuyNFT.sol";
import "./SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MarketNFT is DoBuyNFT, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using SafeMath32 for uint32;
    using SafeMath16 for uint16;

    /// @dev Market Ids
    Counters.Counter public _MarketIds;

    // 마켓 정보
    mapping (uint256 => MarketList) public _MarketList;
    // mapping (uint256 => address) public _MarketToOwner;

    /// @dev Market 
    struct MarketList {
        uint256 _ids; // serial number
        uint16 price_ETH; // Price of ETH
        uint16 price_DoBuy; // Price of DoBuy
        string name; // names
        string img_url; // IMAGE URL
    }

    constructor() {
        _MarketList[_MarketIds.current()] = MarketList(_MarketIds.current(), 0, 0, "NFT SHOP", "DoBuy.png");
    }

    function setMarketList(uint16 _ETH, uint16 _DoBuy, string memory _name, string memory _img_url) external onlyOwner {
        _MarketIds.increment();
        uint256 newMarketId = _MarketIds.current();
        _MarketList[newMarketId] = MarketList(newMarketId, _ETH, _DoBuy, _name, _img_url);
    }

    function delMarketList(uint256 _ids) {
        
    }
}