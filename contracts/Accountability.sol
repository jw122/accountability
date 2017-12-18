pragma solidity ^0.4.4;

contract Accountability {

  address public originator; // address of the individual being held accountable
  address public evilOrg; // address of the recipient of funds if goal not accomplished
  uint public balance; // amount pledged for goal

  function Accountability(address _evilOrg) {
    // constructor
    originator = msg.sender;
    evilOrg = _evilOrg;
  }

  /* check if this works */
  function refundOriginator(){
    originator.send(balance);
  }

  /* Function that enables the contract to receive funds */
  function () payable{

  }

}
