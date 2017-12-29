pragma solidity ^0.4.4;

contract Accountability {

  address public originator; // address of the individual being held accountable
  /*mapping (uint => Goal) goalMap;*/
  Goal public goal;
  uint public approvalCount;

  struct Goal {
    string name;
    string description;
    string deliverableUrl;
    string deliverableImageUrl;
    string judge1Email;
    string judge2Email;
    string judge3Email;
  }

  function Accountability() payable{
    // constructor
    originator = msg.sender;
  }

  function setGoal(string _name, string _description, string _deliverableUrl,
    string _deliverableImageUrl, string _judge1Email, string _judge2Email, string _judge3Email) payable {

    goal = Goal(_name, _description, _deliverableUrl, _deliverableImageUrl, _judge1Email, _judge2Email, _judge3Email);
  }

  function getGoal() returns (string, string, string, string, string, string, string){
    return (goal.name, goal.description, goal.deliverableUrl, goal.deliverableImageUrl, goal.judge1Email, goal.judge2Email,
      goal.judge3Email);
  }

  function setDeliverableLink(string _link){
    goal.deliverableUrl = _link;
  }

  function setDeliverableImage(string _link){
    goal.deliverableImageUrl = _link;
  }

  function castApprovalVote(){
    approvalCount += 1;
  }

  function refundOriginator(){
    originator.transfer(this.balance);
  }

  function () payable{

  }

}
