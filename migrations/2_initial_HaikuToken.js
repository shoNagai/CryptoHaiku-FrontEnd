var HaikuToken = artifacts.require("./HaikuToken.sol");

module.exports = function(deployer) {
  deployer.deploy(HaikuToken, {
    gas:5000000
  });
};
