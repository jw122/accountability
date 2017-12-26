// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import accountability_artifacts from '../../build/contracts/Accountability.json'

// Accountability is our usable abstraction, which we'll use through the code below.
var Accountability = contract(accountability_artifacts);

const ipfsAPI = require('ipfs-api');

const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

window.App = {
  start: function() {
    var self = this;
    Accountability.setProvider(web3.currentProvider);
    renderGoal();

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
  // node.append("<img src='https://ipfs.io/ipfs/" + product[3] + "' width='150px' />");
  node.append("<div>" + goal[0]+ "</div>"); // name of the goal
  node.append("<div>" + goal[1]+ "</div>"); // description of the goal
  return node;
}

/* In this function, we invoke a contract method, setGoal() and pass in the parameters from the form that the user
filled in. We leave the deliverableUrl blank since the goal has not been completed yet */
function saveGoalToBlockchain(params) {
  console.log(params);

  Accountability.deployed().then(function(i) {
    i.setGoal(params["goal-name"], params["goal-description"], "", params["judge1"],
    params["judge2"], params["judge3"], params["evil-org"], {from: web3.eth.accounts[0], gas: 440000, value: web3.toWei(params["deposit"], "ether")}).then(function(f) {
   console.log(f);
   $("#msg").show();
   $("#msg").html("Your goal was successfully added!");
  })
 });
}

function renderGoalDetails() {
 Accountability.deployed().then(function(i) {
  i.getGoal.call().then(function(p) {
   console.log(p);
   let content = "";

   // FOR READING FROM IPFS
   // ipfs.cat(p[4]).then(function(stream) {
   //  stream.on('data', function(chunk) {
   //  // do stuff with this chunk of data
   //  content += chunk.toString();
   //  $("#product-desc").append("<div>" + content+ "</div>");
   //  })
   // });

   $("#goal-name").append("<div>" + p[0]+ "</div>");
   $("#goal-desc").append("<div>" + p[1]+ "</div>");

  })
 })
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
