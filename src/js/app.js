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
      //console.log(App.accounts[0]);
      //alert("0: ",App.accounts[0]);
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
        return App.AddProductButton();
    },
    init: async function() {
        // Load Products.
        var prodInstance;
        App.contracts.ProductReview.deployed().then(function(instance){
            prodInstance = instance;
            return prodInstance.productCount();
        }).then(function(result){
          var counts = result.words[0];
            var html_prodCount = $('#prodCount');
            html_prodCount.text(counts);
            for (i = 0; i < counts; i ++) {
                App.GetProduct(i);
            }
        });
        
        return App.bindEvents();  
    },
    //Getting each product
    GetProduct:function(index){
        App.contracts.ProductReview.deployed().then(function(instance){
            prodInstance = instance;
            return prodInstance.getAProduct(index);
        }).then(function(result){
            //console.log(result);
            /*console.log("Sku : "+result[0]);
            console.log("Name : "+result[1]);
            console.log("Desc : "+result[2]);
            console.log("Price : "+result[3]);
            console.log("Qty : "+result[4]);
            */
            //load the new added product
            var prodDiv = $('#productsDiv');
            var tempDiv = $('#tempProdDiv');
            tempDiv.find('.panel-title').text(result[1]);
            // tempDiv.find('img').attr('src', data[i].picture);
            tempDiv.find('.desc').text(result[2]);
            tempDiv.find('.price').text(result[3]);
            tempDiv.find('.quant').text(result[4]);

            var srcpath = "../images/" + result[1] + ".jpeg";
            console.log(srcpath);
            /*
            var imageEl = document.getElementById("prodImg");
            imageEl.src = srcpath;
            */
            var imageEl = tempDiv.find("#prodImg");
            imageEl.src = srcpath;
            console.log(imageEl);
            tempDiv.find('.btn-buy').attr('data-id', result[0]);
            tempDiv.find('.btn-buy').attr('data-attribute', result[3]);
            tempDiv.find('.btn-review').attr('data-id', result[0]);
            tempDiv.find('.btn-review').attr('id', result[0]);
            tempDiv.find('.get-review').attr('id', result[0]);
            tempDiv.find('.get-all-reviews').attr('id', result[0]);
            tempDiv.find('.reviewbox').attr('id', result[0]);
            prodDiv.append(tempDiv.html());
        });
    },
    //Product card functions
    bindEvents: function() {
        $(document).on('click', '.btn-buy', App.handleBuy);
        $(document).on('click', '.btn-review', App.AddReview);
        $(document).on('click', '.get-review', App.GetReview);
        $(document).on('click', '.get-all-reviews', App.GetAllReviews);
    },
    //Buying function
    handleBuy: function(event) {
        event.preventDefault();
        var prodId = parseInt($(event.target).data('id'));
        var prodInstance;
        App.contracts.ProductReview.deployed().then(function(instance) {
            prodInstance = instance;
            var price = parseInt($(event.target).data('attribute'));
            console.log(price);
            console.log(App.accounts[0]);
            return prodInstance.buyProduct(prodId, {from: App.accounts[0], value: price});
        }).then(function(result) {
            alert("Bought!");
            location.reload();
        });
    },
  
    AddProductButton: function() {
      $(document).on('click', '.addProd', App.AddProduct);
    },
  
    AddReview: function() {
      var review = document.getElementById(this.id).value;
      //console.log(review);
      var id = this.id;
      var prodInstance;
    
      App.contracts.ProductReview.deployed().then(function(instance) {
        prodInstance = instance;
        return prodInstance.reviewProduct(id, review,{from: App.accounts[0]});
      }).then(function(result) {
        alert("Successfully reviewed!");
        //console.log(result);
      });
    },
  
    GetReview: function() {
        var id = this.id;
        alert("User: "+App.accounts[0]);
        var address = App.accounts[0];
        var prodInstance;
        App.contracts.ProductReview.deployed().then(function(instance) {
          prodInstance = instance;
          return prodInstance.getReview(id, address);
        }).then(function(result) {
          alert(result);
        });
    },
  
    GetAllReviews: function() {
      var id = this.id;
      sessionStorage.setItem("id", id);
      location.replace("reviews.html");
      /*
      var prodInstance;
        App.contracts.ProductReview.deployed().then(function(instance) {
          prodInstance = instance;
          return prodInstance.getReviewsCountOfaProduct(id);
        }).then(function(result){
          var counts = result.words[0];
          console.log("Total Reviews : "+counts);
          for (i = 0; i < counts; i++) {
            App.GetOneReview(id,i);
          }
      });*/
    },
  
    GetOneReview:function(id,index){
      var prodInstance;
      var prod;

      App.contracts.ProductReview.deployed().then(function(instance){
          prodInstance = instance;
          return prodInstance.getAProduct(index);
      }).then(function(result){
          prod = result[1];
          console.log(prod);
      });
      App.contracts.ProductReview.deployed().then(function(instance) {
          prodInstance = instance;
          prodInstance.getAReview(id,index).then(function(result) {
              console.log(result);
              var reviews = $('#productreviews');
              var template = $('#reviewtemplate');
              template.find('.review').text(result[0]);
              template.find('.address').text(result[1]);
              template.find('.prod').text(prod);
              template.find('.upVote').text(result[2]);
              template.find('.downVote').text(result[3]);
              template.find('.btn-upvote').attr('data-id', index);
              template.find('.btn-downvote').attr('data-id', index);
              template.find('.btn-upvote').
              reviews.append(template.html());
          }).catch(err => console.log(err));
      }).catch(err => console.log(err));
    },

    AddProduct:function(event){
      var name = document.getElementById('name').value
      var skuId = document.getElementById('skuId').value
      var desc = document.getElementById('desc').value
      var price = document.getElementById('price').value
      var qty = document.getElementById('qty').value
  
      //console.log(name);
      //console.log(skuId);
      //console.log(desc);
      //console.log(price);
      //console.log(qty);
      //console.log(App.accounts);
      var prodInstance;
      App.contracts.ProductReview.deployed().then(function(instance){
        prodInstance = instance;
        return prodInstance.addProduct(skuId, name,desc, price, qty,{from: App.accounts[0]});
        // return prodInstance.addProduct(skuId, name,desc, price, qty).call({gas: 4712388})
      }).then(function(){
          alert("Product added");
          location.reload();
      });
    },
};
  
$(function() {
    $(window).load(function() {
        App.initWeb3();
    });
});
  
const changeAccBut = document.querySelector('.changeAccBut');
const showAccount = document.querySelector('#navbar_address');
  
changeAccBut.addEventListener('click', () => {
    getAccount();
});
function getAccount() {
    location.reload();
}

//for all reviews
/*
const hrefLink = document.querySelector('.all_reviews');
var prodId;
function redirect(){
    sessionStorage.setItem("id", this.id);
    location.href("reviews.html");
}
hrefLink.addEventListener('click',() => {
    redirect();
});*/