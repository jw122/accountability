pragma solidity ^0.4.4;

contract Accountability {

  address public originator; // address of the individual being held accountable
  Goal public goal;

  struct Goal {
    string name;
    string description;
    string deliverableUrl;
    string judge1Email;
    string judge2Email;
    string judge3Email;
    string evilOrg;
  }

  function Accountability() payable{
    // constructor
    originator = msg.sender;
  }

  function setGoal(string _name, string _description, string _deliverableUrl,
    string _judge1Email, string _judge2Email, string _judge3Email, string _evilOrg){

    goal = Goal(_name, _description, _deliverableUrl, _judge1Email, _judge2Email, _judge3Email, _evilOrg);
  }

  function getGoal() returns (string, string, string, string, string, string, string){
    return (goal.name, goal.description, goal.deliverableUrl, goal.judge1Email, goal.judge2Email,
      goal.judge3Email, goal.evilOrg);
  }

  function refundOriginator(){
    originator.transfer(this.balance);
  }

  /* TODO: create a function that sends out the funds when time is up and goal wasn't achieved */

  /* Function that enables the contract to receive funds */
  function () payable{

  }

}
