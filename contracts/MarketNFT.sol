// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DoBuyNFT.sol";
// import "./SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MarketNFT is DoBuyNFT, Ownable {
    // using SafeMath for uint256;
    // using SafeMath32 for uint32;
    // using SafeMath16 for uint16;

    /// @dev Market Ids
    uint32 public _MarketIds;

    // 마켓 정보
    mapping (uint256 => MarketList) public _MarketList;
    // mapping (uint256 => address) public _MarketToOwner;

    /// @dev Product Counts
    uint32 public ProductCounts;
    
    /// @dev Product Transaction
    struct ProductTrans {
        string name_product;
        address whobuy;
    }

    // 유저들이 사는 마켓 품목들
    mapping (uint32 => ProductTrans) public ProductBuy;

    /// @dev Market 
    struct MarketList {
        uint256 _ids; // serial number
        string price_ETH; // Price of ETH
        uint256 price_DoBuy; // Price of DoBuy
        string name; // names
        string img_url; // IMAGE URL
    }

    constructor() {
        _MarketList[_MarketIds] = MarketList(_MarketIds, "0", 0, "NFT SHOP", "DoBuy.png");
        _MarketIds++;
        _MarketList[_MarketIds] = MarketList(_MarketIds, "0.012", 1200, "Potato", "potato.jpg");
        _MarketIds++;
        _MarketList[_MarketIds] = MarketList(_MarketIds, "0.025", 2500, "Banana", "banana.jpg");
        _MarketIds++;
        _MarketList[_MarketIds] = MarketList(_MarketIds, "0.01", 1000, "Apple", "apple.jpg");
    }

    /**
    *  @dev MarketList의 물건 추가
    *  @param _ETH ETH 가격
    *  @param _DoBuy DoBuy 가격
    *  @param _name 물건 이름
    *  @param _img_url 물건 사진경로
    */
    function setMarketList(string memory _ETH, uint256 _DoBuy, string memory _name, string memory _img_url) external onlyOwner {
        _MarketIds++;
        uint256 newMarketId = _MarketIds;
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
        ProductBuy[ProductCounts] = ProductTrans(_MarketList[_num_ids].name, msg.sender);
        ProductCounts++;
        _marketBuy(_MarketList[_num_ids].name, _MarketList[_num_ids].img_url);
    }

    function changePrice(string memory _name, string memory _Eth_price, uint256 _dobuy_price) public {
        for(uint32 i = 1; i <= _MarketIds; i++) {
            if(keccak256(bytes(_MarketList[i].name)) == keccak256(bytes(_name))){
                _MarketList[i].price_ETH = _Eth_price;
                _MarketList[i].price_DoBuy = _dobuy_price;
            }
        }
    }
}