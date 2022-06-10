// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <=0.6.0;

contract PRToken {
    //Token details
    string  public name = "PRT Token";
    string  public symbol = "PRT";
    string  public standard = "DApp Token v1.0";
    uint256 public totalSupply;
    address public admin;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    event Burn(
    	address indexed _reviewer,
    	uint256 _value
    	);

    mapping(address => uint256) public balanceOf;
     
    constructor (uint256 _initialSupply) public {
        admin = msg.sender;
        balanceOf[admin] = _initialSupply;
        totalSupply = _initialSupply;
    }
    function transfer(address _to, uint256 _value) public returns (bool success) {
        balanceOf[admin] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    function reviewtoken(address reviewer, uint256 _value) public returns (bool success) { 
    	require(balanceOf[reviewer] == 1, "Token not transferred");
    	balanceOf[reviewer] -= _value;
    	emit Burn(reviewer, _value);
    	return true;
    }
}