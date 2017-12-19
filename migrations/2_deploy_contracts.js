var MetaCoin = artifacts.require("./MetaCoin.sol");
var Accountability = artifacts.require("./Accountability");

module.exports = function(deployer) {
  deployer.deploy(MetaCoin);
  deployer.deploy(Accountability, web3.eth.accounts[1], {from: web3.eth.accounts[0]});
};
