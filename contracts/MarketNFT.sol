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

    /// @dev Trade
    struct TradeList {
        string price_ETH; // Price of ETH
        uint256 price_DoBuy; // Price of DoBuy
    }
    
    // 개인간 거래 가격
    mapping(uint32 => TradeList) public TradeSell;

    // 개인간 거래 올려놓았는지 여부
    mapping(uint32 => bool) public _selling;

    constructor() {
        _MarketList[_MarketIds] = MarketList(_MarketIds, "0", 0, "NFT SHOP", "DoBuy.png");
        _MarketIds++;
        _MarketList[_MarketIds] = MarketList(_MarketIds, "0.04", 4000, "White_jordan", "white_jo.png");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "0.05", 5000, "Yellow_jordan", "yellow_jo.png");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "0.08", 8000, "Descente", "dessa.png");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "2", 200000, "RollsUmbrella", "rose.png");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "30", 3000000, "GucciBag", "gucci.jpg");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "0.4", 400000, "Razer", "razer.jpg");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "0.2", 200000, "MacBook", "notebook.jpg");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "0.15", 150000, "Ipad", "ipad.jpg");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "0.012", 1200, "Potato", "potato.jpg");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "0.025", 2500, "Banana", "banana.jpg");
        // _MarketIds++;
        // _MarketList[_MarketIds] = MarketList(_MarketIds, "0.01", 1000, "Apple", "apple.jpg");
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
    function delMarketList(uint256 _num_ids) public onlyOwner {
        delete _MarketList[_num_ids];
    }

    /**
    *  @dev MarketList의 물건이름과 저장된 물건 데이터를 삭제
    *  @param _names 물건 이름
    */
    function found(string memory _names) public {
        for(uint256 i = 0; i <= _MarketIds; i++) {{
            if(keccak256(bytes(_names)) == keccak256(bytes( _MarketList[i].name))) {
                delMarketList(i);
            }
        }}
    }

    /**
    *  @dev MarketList의 물건 사기
    *  @param _num_ids 물건 고유번호
    */
    function buyMarket(uint256 _num_ids, string memory _made_by) external {
        ProductBuy[ProductCounts] = ProductTrans(_MarketList[_num_ids].name, msg.sender);
        ProductCounts++;
        _marketBuy(_MarketList[_num_ids].name, _MarketList[_num_ids].img_url, _made_by);
    }

    function buyUser(uint32 _num_ids) external {
        _DoBuyToOwner[_num_ids] = msg.sender;
        _selling[_num_ids] = false;
        // _marketBuy(_MarketList[_num_ids].name, _MarketList[_num_ids].img_url, _made_by);
    }

    /**
    *  @dev MarketList의 물건 가격 변경
    *  @param _name 물건 이름
    *  @param _Eth_price 이더리움 가격
    *  @param _dobuy_price DoBuy 토큰 가격
    */
    function changePrice(string memory _name, string memory _Eth_price, uint256 _dobuy_price) public {
        for(uint32 i = 1; i <= _MarketIds; i++) {
            if(keccak256(bytes(_MarketList[i].name)) == keccak256(bytes(_name))){
                _MarketList[i].price_ETH = _Eth_price;
                _MarketList[i].price_DoBuy = _dobuy_price;
            }
        }
    }

    /**
    *  @dev TradeList에 올려서 물건 팔기
    *  @param _num_ids NFT 고유번호
    *  @param _eth_price 이더리움 가격
    *  @param _dobuy_price DoBuy 토큰 가격
    */
    function sellTrade(uint32 _num_ids, string memory _eth_price, uint256 _dobuy_price) public {
        TradeSell[_num_ids] = TradeList(_eth_price, _dobuy_price);
        _selling[_num_ids] = true;
    }

    function cancelTrade(uint32 _num_ids) public {
        delete TradeSell[_num_ids];
        _selling[_num_ids] = false;
    }
}