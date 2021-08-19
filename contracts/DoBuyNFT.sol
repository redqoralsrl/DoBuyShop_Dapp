// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


// import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract DoBuyNFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  address private owner;
  /// @dev NFT Ids
  Counters.Counter public _tokenIds;

  /// @dev NFT struct
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

  /// @dev Trade Ids
  Counters.Counter public _tradeIds;

  /// @dev Trade struct
  struct tradeTrans {
    address _from;
    address _to;
    string name;
  }

  // NFT 거래내역
  mapping (uint256 => tradeTrans) public _TradeTransaction;

  constructor() ERC721("DoBuyNFT", "DBNFT") {
    owner = msg.sender;
    _DoBuylist[_tokenIds.current()] = NFTcard(_tokenIds.current(), block.timestamp, "DoBuy Start!", "DoBuy.png");
    _DoBuyToOwner[_tokenIds.current()] = msg.sender;
    emit DoBuyCreated(msg.sender, _tokenIds.current());
  }

  /**
   *  @dev NFT 제작 및 NFT Token 제작
   *  @param _name NFT 제목
   *  @param _image_url NFT 이미지 경로
   */
  function mint(string memory _name, string memory _image_url) external {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _DoBuylist[newItemId] = NFTcard(newItemId, block.timestamp, _name, _image_url);
    _mint(msg.sender, newItemId);
    _DoBuyToOwner[newItemId] = msg.sender;
    emit DoBuyCreated(msg.sender, newItemId);
  }

  /**
   *  @dev NFT 개인간의 거래
   *  @param _Id NFT _Ids
   */
  function transferNFT(uint256 _Id) external {
    address temp = _DoBuyToOwner[_Id];
    _tradeIds.increment();
    _transfer(temp, msg.sender, _Id);
    _DoBuyToOwner[_Id] = msg.sender;
    _TradeTransaction[_tradeIds.current()] = tradeTrans(temp, msg.sender, _DoBuylist[_Id].name);
  }

  /**
   *
   */
  function buyNFT() external {
    
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


    /// @dev delivery - 배송 누르면 기존 NFT 제거
    function burnNFT(uint256 _Id) external {
      require(ownerOf(_Id) == msg.sender);    // 자기 NFT만 burn 가능. 관리자도 burn 가능하게 할까...
      _burn(_Id);   // NFT burn
      
      // 1 - 될지 모르겠음
      delete _DoBuyToOwner[_Id];  // 해당 NFT 소유자 배열(_DoBuyToOwner) 삭제
      delete _DoBuylist[_Id];   // 해당 NFT card를 가진 _DoBuylist 배열 삭제 

      // 2 - 안되면 이런식으로 하기
      // _DoBuyToOwner[_Id] = address(0);    // 해당 NFT 소유자 배열(_DoBuyToOwner) clear
    }
}
