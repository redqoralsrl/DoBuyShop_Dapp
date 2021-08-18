// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


// import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract DoBuyNFT is ERC721URIStorage {
  using Counters for Counters.Counter;

  /// @notice NFT Ids
  Counters.Counter private _tokenIds;

  /// @notice NFT struct
  struct NFTcard {
    uint256 _Ids; // NFT serial number
    uint256 timestamp; // Time Created
    string name; // NFT names
    string image_url; // IMAGE URL
  }

  // 토큰 생성
  mapping (uint256 => NFTcard) public _DoBuylist;
  mapping (uint256 => address) public _DoBuyToOwner;
  event DoBuyCreated (address , uint256);

  /// @notice Trade Ids
  Counters.Counter private _tradeIds;

  /// @notice Trade struct
  struct tradeTrans {
    address _from;
    address _to;
    string name;
  }

  // NFT 거래내역
  mapping (uint256 => tradeTrans) public _TradeTransaction;

  constructor() ERC721("DoBuyNFT", "DBNFT") {
    _DoBuylist[_tokenIds.current()] = NFTcard(_tokenIds.current(), block.timestamp, "DoBuy Strat!", "");
    _DoBuyToOwner[_tokenIds.current()] = msg.sender;
    emit DoBuyCreated(msg.sender, _tokenIds.current());
  }

  /**
   *  @notice make NFT
   *  @dev NFT 제작 및 NFT Token 제작
   *  @param _name NFT 제목
   *  @param _image_url NFT 이미지 경로
   */
  function mint(string memory _name, string memory _image_url) public {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _DoBuylist[newItemId] = NFTcard(newItemId, block.timestamp, _name, _image_url);
    _mint(msg.sender, newItemId);
    _DoBuyToOwner[newItemId] = msg.sender;
    emit DoBuyCreated(msg.sender, newItemId);
  }

  function transferNFT(uint256 memory _Id) public {
    address memory temp = _DoBuyToOwner[_Id];
    _tradeIds.increment();
    safeTransferFrom(temp, msg.sender, _Id);
    _DoBuyToOwner[_Id] = msg.sender;
    _TradeTransaction[_tradeIds] = tradeTrans(temp, msg.sender, _DoBuylist[_Id].name);

  }

    //   /// @dev NFT 양도
    // /// 1. 판매자가 사이트에 NFT 판매글 올려놓으면 구매자가 선택해서 구매 (소유자: 판매자)
    // /// 2. 구매자가 구매 버튼으로 판매자에게 토큰 지불
    // /// 3. 사이트에서 구매자 권한 approve해주고 safeTransferFrom으로 소유자 변경 (소유자: 구매자)
    // function buyNFTfromUser(uint newItemId) public {
    //     //require(isPayed);
    //     approve(msg.sender, newItemId);
    //     safeTransferFrom(ownerOf(newItemId), msg.sender, newItemId);
    // }

  function () payable {
    
  }
}
