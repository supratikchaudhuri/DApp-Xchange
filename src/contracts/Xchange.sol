pragma solidity ^0.5.0;

import "./Token.sol";

contract Xchange {
    string public name = 'Xchange Instant Exchange';
    Token public token;
    uint public rate = 10;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );
    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );
    constructor(Token _token) public {
        token = _token;
    } 

    function buy() public payable {
        //msg.value how much ether was send when this fn was called
        uint tokenAmount = msg.value * rate;
        
        //see ifexchange has enough tokens to give
        require(token.balanceOf(address(this)) >= tokenAmount); //require return bool.... if false then break and throw error
        
        token.transfer(msg.sender, tokenAmount);

        //trigger emit evt..... (token was purchased)
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate); 
    }


    function sell(uint _amount) public {
        //trader cant sell more than he got
        require(token.balanceOf(msg.sender) >= _amount);
        
        uint etherAmount = _amount / rate;
        
        //checking if exchange has enough ether ornot
        require(address(this).balance >= etherAmount);

        //sending them ether
        token.transferFrom(msg.sender, address(this), _amount); //smart contract to spend your tokens for you
        msg.sender.transfer(etherAmount);
        emit TokensSold(msg.sender, address(token), _amount, rate); 
    }

}