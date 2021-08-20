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

    /**
    *  @dev MarketList의 물건 추가
    *  @param _ETH ETH 가격
    *  @param _DoBuy DoBuy 가격
    *  @param _name 물건 이름
    *  @param _img_url 물건 사진경로
    */
    function setMarketList(uint16 _ETH, uint16 _DoBuy, string memory _name, string memory _img_url) external onlyOwner {
        _MarketIds.increment();
        uint256 newMarketId = _MarketIds.current();
        _MarketList[newMarketId] = MarketList(newMarketId, _ETH, _DoBuy, _name, _img_url);
    }

    /**
    *  @dev MarketList의 물건 삭제
    *  @param _num_ids 물건 고유번호
    */
    function delMarketList(uint256 _num_ids) external onlyOwner {
        delete _MarketList[_num_ids];
    }

    function buyMarket(uint256 _num_ids) external {
        _marketBuy(_MarketList[_num_ids].name, _MarketList[_num_ids].img_url);
    }
}