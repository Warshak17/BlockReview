// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <=0.6.0;
import "./PRToken.sol";

contract ProductReview {
    struct Status {
        bool isBuy;
        bool isReview;
        string reviewDescription;
        uint timeStamp;
    }
    struct Votes{
        uint downVotes;
        uint upVotes;
    }
    struct Product {
        uint id;
        string name;
        string description;
        uint price;
        uint quantity;
        address payable productOwner;
        bool isExist;
        address rater;
        string [] reviews;
        mapping(uint=>Votes) userReviewVotes;
        uint reviewsCount;
        mapping (address=>Status) productUserReview; 
    }

    mapping (uint=>Product) public products;

    PRToken public tokencontract;
    uint[] productIds;
    uint public productCount;
    address public admin;
    uint reviewReturn = 1000;

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    constructor(PRToken _tokencontract) public{
      admin = msg.sender;
      tokencontract = PRToken(_tokencontract); 
    }
    
    event sell(address _buyer, uint256 _token);
    event ProductRegistered(uint256 productId);
    event ProductRegistrationFailed(uint256 productId);

    function addProduct(uint skuId, string memory name, string memory description, uint price, uint quantity) public{
        require(products[skuId].isExist == false, "Product Already Added");
        productCount+=1;
        products[skuId].id = skuId;
        products[skuId].name = name;
        products[skuId].description = description;
        products[skuId].price = price;
        products[skuId].quantity = quantity;
        products[skuId].productOwner = msg.sender;
        products[skuId].isExist = true;
        productIds.push(skuId);
        
    }
    
    function buyProduct(uint skuId) public payable{
        require(products[skuId].isExist == true, "Product Not Exist");
        require(products[skuId].quantity > 0, "Product Out of Stock");
        require(msg.value >= products[skuId].price , "Insufficient Ether passed");
           
        products[skuId].productUserReview[msg.sender].isBuy = true;
        products[skuId].quantity--;
          
        if(msg.value > products[skuId].price){
            msg.sender.transfer(msg.value - products[skuId].price); //extra ammount transferred
        }
        products[skuId].productOwner.transfer(products[skuId].price-reviewReturn); //Product price transferred to seller"
        msg.sender.transfer(reviewReturn); //1000 weis returned to buyer"   
        // token transferred to buyer after buying product
        require(tokencontract.transfer(msg.sender,1),"transferred Unsuccessful");
        emit sell (msg.sender , 1);
    }
    
    function reviewProduct(uint skuId, string memory review) public{
        require(tokencontract.reviewtoken(msg.sender,1), "Token check failed"); //reviewer possess token to review
        require(products[skuId].isExist == true, "Product Not Exist");
        require(products[skuId].productUserReview[msg.sender].isBuy == true, "You are not eligible to review this product");
        require(products[skuId].productUserReview[msg.sender].isReview == false, "You have Already reviewed this product");
             
        products[skuId].productUserReview[msg.sender].isReview = true;
        products[skuId].productUserReview[msg.sender].reviewDescription = review;
        products[skuId].productUserReview[msg.sender].timeStamp = now;
        products[skuId].userReviewVotes[products[skuId].reviewsCount].upVotes = 0;
        products[skuId].userReviewVotes[products[skuId].reviewsCount].downVotes = 0;
        products[skuId].reviewsCount ++;
        products[skuId].rater = msg.sender;
        products[skuId].reviews.push(review);
    }
    
    function getReview(uint skuId, address user) public view returns (string memory review){
       return products[skuId].productUserReview[user].reviewDescription;
    }
    
    function getAReview(uint skuId, uint index) public view returns (string memory review, address reviewer,uint upVote,uint downVote){
       review = products[skuId].reviews[index];
       reviewer = products[skuId].rater;
       upVote = products[skuId].userReviewVotes[index].upVotes;
       downVote = products[skuId].userReviewVotes[index].downVotes;
    }
    function getReviewsCountOfaProduct(uint skuId) public view returns (uint){
       return products[skuId].reviewsCount;
    }

    function getAProduct(uint index) public view returns (uint skuId, string memory name, string memory description, uint256 price, uint256 quantity){
       skuId = products[productIds[index]].id;
       name = products[productIds[index]].name;
       description = products[productIds[index]].description;
       price = products[productIds[index]].price;
       quantity = products[productIds[index]].quantity;
    }
    function vote(uint id, uint index,string memory action) public {
        require(msg.sender == admin,"Only admin can vote");

        if(keccak256(abi.encodePacked((action))) == keccak256(abi.encodePacked(("UpVote")))){
            products[productIds[id]].userReviewVotes[index].upVotes ++;
        }else{
            products[productIds[id]].userReviewVotes[index].downVotes ++;
        }
    }
}