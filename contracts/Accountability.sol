pragma solidity ^0.4.4;

contract Accountability {

  address public originator; // address of the individual being held accountable
  address public evilOrg; // address of the recipient of funds if goal not accomplished

  function Accountability(address _evilOrg) payable{
    // constructor
    originator = msg.sender;
    evilOrg = _evilOrg;
  }

  function refundOriginator(){
    originator.transfer(this.balance);
  }

  /* Function that enables the contract to receive funds */
  function () payable{

  }

}
