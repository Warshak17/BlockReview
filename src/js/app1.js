App = {
    web3Provider: null,
    contracts: {},
    accounts: null,

    initWeb3: async function() {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch (error) {
                console.error("User denied account access")
            }
        }else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
  
        web3 = new Web3(App.web3Provider);
        App.accounts = await web3.eth.getAccounts();
        var navbarAddressField = $('#navbar_address');
        navbarAddressField.text(App.accounts);
        //const id = sessionStorage.getItem("id");
        //alert(id);
        return App.initContract();
    },

    //Initialise contract
    initContract: function() {
        $.getJSON('ProductReview.json', function(data) {
            var ProductReviewArtifact = data;
            App.contracts.ProductReview = TruffleContract(ProductReviewArtifact);
            App.contracts.ProductReview.setProvider(App.web3Provider);
            return App.init();
        });
    },

    init: async function() {
        // Load Reviews.
        var prodInstance;
        var id = sessionStorage.getItem("id");
        console.log(id);
        
        App.contracts.ProductReview.deployed().then(function(instance) {
            prodInstance = instance;
            return prodInstance.getReviewsCountOfaProduct(id);
        }).then(function(result){
            //console.log(result);
            var counts = result.words[0];
            var html_prodCount = $('#revCount');
            html_prodCount.text(counts);
            //console.log("Total Reviews : "+counts);
            for (i = 0; i < counts; i++) {
                App.GetOneReview(id,i);
            }
        });
        return App.bindEvents();  
    },

    //Load each Reviews
    GetOneReview:function(id,index){
        var prodInstance;
        var prod;
  
        App.contracts.ProductReview.deployed().then(function(instance){
            prodInstance = instance;
            console.log(id);
            return prodInstance.getAProduct(id);
        }).then(function(result){
            prod = result[1];
            console.log(prod);
        });
        App.contracts.ProductReview.deployed().then(function(instance) {
            prodInstance = instance;
            prodInstance.getAReview(id,index).then(function(result) {
                //console.log();
                var reviews = $('#productreviews');
                var template = $('#reviewtemplate');
                template.find('.review').text(result[0]);
                template.find('.address').text(result[1]);
                template.find('.prod').text(prod);
                template.find('#revId').text(index);
                template.find('.upVote').text(result[2]);
                template.find('.downVote').text(result[3]);
                template.find('.btn-upvote').attr('data-id', index);
                template.find('.btn-downvote').attr('data-id', index);
                reviews.append(template.html());
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    },
    //BindEvents
    bindEvents: function() {
        $(document).on('click', '.btn-upvote', App.upVote);
        $(document).on('click', '.btn-downvote', App.downVote);
    },

    upVote: function(event){
        var revIdelem = document.getElementById("revId");
        var index = revIdelem.innerHTML;
        var id = sessionStorage.getItem("id");
        console.log("Id: ",id,"Index: ",index);
        //console.log(index);

        var prodInstance;
        App.contracts.ProductReview.deployed().then(function(instance) {
            prodInstance = instance;
            return prodInstance.vote(id,index, "UpVote",{from: App.accounts[0]});
        }).then(function(result) {
            alert("Upvoted!");
            location.reload();
        });
    },
    downVote: function(event){
        var revIdelem = document.getElementById("revId");
        var index = revIdelem.innerHTML;
        var id = sessionStorage.getItem("id");
        console.log(index);

        var prodInstance;
        App.contracts.ProductReview.deployed().then(function(instance) {
            prodInstance = instance;
            return prodInstance.vote(id, index, "DownVote",{from: App.accounts[0]});
        }).then(function(result) {
            alert("Downvoted!");
            location.reload();
        });
    },
};

$(function() {
    $(window).load(function() {
        App.initWeb3();
    });
});
//Change Account Button 
const changeAccBut = document.querySelector('.changeAccBut');
const showAccount = document.querySelector('#navbar_address');
  
changeAccBut.addEventListener('click', () => {
    getAccount();
});
function getAccount() {
    location.reload();
}