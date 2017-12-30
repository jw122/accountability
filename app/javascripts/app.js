// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import accountability_artifacts from '../../build/contracts/Accountability.json'

// Accountability is our usable abstraction, which we'll use through the code below.
var Accountability = contract(accountability_artifacts);
// use contract at specific address: var instance = MetaCoin.at("0x1234...");

const ipfsAPI = require('ipfs-api');
const ethUtil = require('ethereumjs-util');
const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

window.App = {
  start: function() {
    var self = this;
    var reader;
    Accountability.setProvider(web3.currentProvider);

    renderGoal();

    $("#goal-image").change(function(event) {
      const file = event.target.files[0]
      reader = new window.FileReader()
      reader.readAsArrayBuffer(file)
    });

    // Event triggered when user clicks save. 'add-goal' is the id of the form
    $("#add-goal").submit(function(event) {
      // serialize the input in this field
       const req = $("#add-goal").serialize();
       console.log("adding goal!")
       let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
       let decodedParams = {}

       Object.keys(params).forEach(function(v) {
        decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
       });

       // call on the saveGoal function, passing in the fields
       saveGoalToBlockchain(decodedParams);
       event.preventDefault();
    });

    // Event triggered when user clicks add deliverable. 'submit-deliverable' is the id of the form
    $("#submit-deliverable").submit(function(event) {
      // serialize the input in this field
       const req = $("#submit-deliverable").serialize();
       console.log("adding deliverable link!")
       let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
       let decodedParams = {}

       Object.keys(params).forEach(function(v) {
        decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
       });

       // call on the saveGoal function, passing in the fields
       saveDeliverableLink(decodedParams);
       event.preventDefault();
    });

    $("#submit-image").submit(function(event) {
       // the reader already has the image contents
       saveDeliverableImage(reader);
       event.preventDefault();
    });

    $("#submit-vote1").submit(function(event) {
      var vote = document.getElementById("vote1").value;
      console.log("vote submitted: ", vote);
      castVote(vote);
      event.preventDefault();
    });

    $("#submit-vote2").submit(function(event) {
      var vote = document.getElementById("vote2").value;
      console.log("vote submitted: ", vote);
      castVote(vote);
      event.preventDefault();
    });

    $("#submit-vote3").submit(function(event) {
      var vote = document.getElementById("vote3").value;
      console.log("vote submitted: ", vote);
      castVote(vote);
      event.preventDefault();
    });

    if($("#goal-details").length > 0) {
     //This is the goal details page
     renderGoalDetails();
    }
  },
};

function renderGoal() {
  console.log("in renderGoal")
  Accountability.deployed().then(function(i) {
    console.log("in Accountability.deployed()")
    /* stores the return of the function i.getGoal.call(1) inside the b value and passes it to buildGoal.
    Then, append the result of that buildGoal() to goal-list */
    i.getGoal.call().then(function(g) {
      console.log("got goal!");
     $("#goal-list").append(buildGoal(g));
    });
  });
}

/* initialize a div, give it a class and append to it
it knows where to append itself because buildProduct() is called from inside renderGoal(), by #goal-list which is a
row class in index.html */
function buildGoal(goal) {

  let node = $("<div/>");
  node.addClass("col-sm-3 text-center col-margin-bottom-1");
  // node.append("<img src='https://ipfs.io/ipfs/" + product[3] + "' width='150px' />"); // image of the goal
  node.append("<div>" + goal[0]+ "</div>"); // name of the goal
  node.append("<div>" + goal[1]+ "</div>"); // description of the goal
  return node;
}

/* In this function, we invoke a contract method, setGoal() and pass in the parameters from the form that the user
filled in. We leave the deliverableUrl blank since the goal has not been completed yet */
function saveGoalToBlockchain(params) {
  console.log(params);

  Accountability.deployed().then(function(i) {
    i.setGoal(params["goal-name"], params["goal-description"], "", "", params["judge1"],
    params["judge2"], params["judge3"], {from: web3.eth.accounts[0], gas: 440000, value: web3.toWei(params["deposit"], "ether")}).then(function(f) {
   console.log(f);
   $("#msg").show();
   $("#msg").html("Your goal was successfully added!");
  })
 });
}

function saveDeliverableLink(params) {
  let descId;
  // First, save on IPFS
  saveTextBlobOnIpfs(params["deliverable"]).then(function(id){
    descId = id;
    // trigger function in contract that edits the deliverable
    saveDeliverableLinkToBlockchain(descId);
  })
}

function saveDeliverableImage(reader) {
  let imageId;
  // First, save on IPFS
  saveImageOnIpfs(reader).then(function(id){
    imageId = id;
    // trigger function in contract that edits the image
    saveDeliverableImageToBlockchain(imageId);
  })
}

function saveDeliverableLinkToBlockchain(link) {
  console.log("saving deliverable link to blockchain:", link);

  Accountability.deployed().then(function(i) {
    i.setDeliverableLink(link, {from: web3.eth.accounts[0], gas: 440000}).then(function(f) {
   console.log(f);
   $("#msg").show();
   $("#msg").html("Your deliverable link was successfully added!");
  })
 });
}

function saveDeliverableImageToBlockchain(link) {
  console.log("saving deliverable image to blockchain:", link);

  Accountability.deployed().then(function(i) {
    i.setDeliverableImage(link, {from: web3.eth.accounts[0], gas: 440000}).then(function(f) {
   console.log(f);
   $("#msg").show();
   $("#msg").html("Your deliverable image was successfully added!");
  })
 });
}


function saveTextBlobOnIpfs(blob) {
  return new Promise(function(resolve, reject) {
    const descBuffer = Buffer.from(blob, 'utf-8');
    ipfs.add(descBuffer)
    .then((response) => {
     console.log(response)
     resolve(response[0].hash);
    }).catch((err) => {
     console.error(err)
     reject(err);
    })
  });
}

function saveImageOnIpfs(reader) {
   return new Promise(function(resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer)
    .then((response) => {
     console.log(response)
     resolve(response[0].hash);
    }).catch((err) => {
     console.error(err)
     reject(err);
    })
  });
}

function renderGoalDetails() {
 Accountability.deployed().then(function(i) {
  i.getGoal.call().then(function(p) {
   console.log(p);
   let content = "";

   if (p[2].length > 0 || p[3].length > 0) {
     $("#judge-section").show();
   } else {
     $("#judge-section").hide();
   }

   // Reading from IPFS
   if (p[2].length > 0) { // if there is actually a deliverable link
     ipfs.cat(p[2]).then(function(stream) {
      stream.on('data', function(chunk) {
      // append the read chunk to the content string
      content += chunk.toString();
      $("#goal-final-deliverable").append("<div>" + content+ "</div>");
      })
     });
   }

   $("#goal-name").append("<div>" + p[0]+ "</div>");
   $("#goal-desc").append("<div>" + p[1]+ "</div>");
   if (p[3].length > 0){ // if there is actually a deliverable image
     $("#goal-final-image").append("<img src='https://ipfs.io/ipfs/" + p[3] + "' width='250px' />");
   }
   if (p[0].length > 0) { // if goal has been set (aka it has a name)
     getRemainingTime(getCountdown);
   }
 });
});
}

function castVote(vote){
  if (vote == "approve") {
    Accountability.deployed().then(function(i){
      i.castApprovalVote({from: web3.eth.accounts[0], gas: 440000}).then(function(ret) {
       console.log(ret);
       $("#msg").show();
       $("#msg").html("Your approval vote was successfully cast. Thank you for voting!");

       i.refundIssued.call().then(function(refunded){
         console.log("refunded: ", refunded);
         if (refunded == true) {
           $("#goal-approved-msg").append("<h3>Success! After a majority of judges approved the deliverable, the originator has been refunded for achieving their goal.</h3>")
         }
       });
     });

    })
  } else {
    $("#msg").show();
    $("#msg").html("Thank you for voting!");
  }
}

function getCurrentTimeInSeconds(){
 return Math.round(new Date() / 1000);
}

function getRemainingTime(callback) {
 let current_time = getCurrentTimeInSeconds()
 var goal_start_time;
 var goal_end_time;
 var remaining_seconds;
 var today = new Date();
 var finalCountdown;

 Accountability.deployed().then(function(i){
   i.goalStartTime.call().then(function(t){
     goal_start_time = t;
     goal_end_time = parseInt(goal_start_time) + (30*24*60*60); // end time is start time + 30 days
     remaining_seconds = goal_end_time - current_time;
     if (callback) {
       finalCountdown = callback(remaining_seconds);
     }
   });
 });
}

function getCountdown(remaining_seconds){
  if (remaining_seconds <= 0) {
   return "Goal period has ended";
  }

  let days = Math.trunc(remaining_seconds / (24*60*60));

  remaining_seconds -= days*24*60*60 // subtract number of days (in seconds) from total seconds
  let hours = Math.trunc(remaining_seconds / (60*60));

  remaining_seconds -= hours*60*60 // subtract number of hours (in seconds) from total seconds
  let minutes = Math.trunc(remaining_seconds / 60);

  if (days > 0) {
   $("#countdown").html("Goal due in " + days + " days, " + hours + ", hours, " + minutes + " minutes");
  } else if (hours > 0) {
   $("#countdown").html("Goal due in " + hours + " hours, " + minutes + " minutes ");
  } else if (minutes > 0) {
   $("#countdown").html("Goal due in " + minutes + " minutes ");
  } else {
   $("#countdown").html("Goal due in " + remaining_seconds + " seconds");
  }
}

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
