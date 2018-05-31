pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./Mortal.sol";

contract HaikuToken is ERC721Token, Mortal, Pausable {

  struct Haiku {
    string content;
    address mintAddr;
    uint64 mintTime;
  }

  Haiku[] Haikus;
  
  mapping (string => address) internal uriToToMintAddr;

  constructor() public ERC721Token("HaikuToken", "HKT") {

  }

  function mint(string _content, string _uri) external whenNotPaused returns(uint256) {
    require(msg.sender != address(0));
    require(uriToToMintAddr[_uri] == address(0));

    Haiku memory haiku = Haiku({
      content: _content,
      mintAddr: msg.sender,
      mintTime: uint64(now)
    });

    uint256 tokenId = Haikus.push(haiku) - 1;
    super._mint(msg.sender, tokenId);
    super._setTokenURI(tokenId, _uri);

    uriToToMintAddr[_uri] = msg.sender;

    return tokenId;
  }

  function burn(uint256 _tokenId) external onlyOwnerOf(_tokenId) {
    super._burn(msg.sender, _tokenId);
  }

  function getAllHaikus() external view returns (uint256[]) {
    return allTokens;
  }

  function getOwnedHaikus() external view returns (uint256[]) {
    require(msg.sender != address(0));
    return ownedTokens[msg.sender];
  }

  function getTargetHaikus(address _target) external view returns (uint256[]) {
    require(_target != address(0));
    return ownedTokens[_target];
  }

  function getHaiku(uint256 _tokenId) external view returns (string content, address mintAddr, uint64 mintTime, string tokenUri) {
    
    Haiku memory haiku = Haikus[_tokenId];
    content = haiku.content;
    mintAddr = haiku.mintAddr;
    mintTime = haiku.mintTime;
    tokenUri = tokenURIs[_tokenId];
  }
}
