var MetaCoin = artifacts.require("./MetaCoin.sol");
var Accountability = artifacts.require("./Accountability");

module.exports = function(deployer) {
  // deployer.deploy(Accountability, web3.eth.accounts[1], {from: web3.eth.accounts[0], value: web3.toWei(0.5, "ether")});
  deployer.deploy(Accountability);
};
