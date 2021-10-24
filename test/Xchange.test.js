const { assert } = require('chai');

const Token = artifacts.require("Token");
const Xchange = artifacts.require("Xchange");

//configuring chai
require('chai')
    .use(require('chai-as-promised'))
    .should()

const tokens = (n) => {
    return web3.utils.toWei(n, 'ether')
}

contract('Xchange', ([exchange, trader]) => {
    let token, xchange

    before(async() => {
        token = await Token.new()
        xchange = await Xchange.new(token.address)
        //transfer all tokens
        await token.transfer(xchange.address, tokens('1000000'))
    })


    describe('Token Deployment', async() => {
        it('Token has a name', async() => {
            const name = await token.name()
            assert.equal(name, 'Supra Token')
        })
    })

    describe('Xchange Deployment', async() => {
        it('Contract has a name', async() => {
            const name = await xchange.name()
            assert.equal(name, 'Xchange Instant Exchange')
        })

        it('Contract has Supra tokens', async() => {
            let balance = await token.balanceOf(xchange.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Buying Tokens Function [buy()]', async() => {
        let result

        before(async() => {
            result = await xchange.buy({from: trader, value: web3.utils.toWei('1', 'ether')})
        })
        it('Allows user to purcase Supra tokens from the exchange', async() => {
            //check if trader has rcvd the tokens after purchase
            let traderBalance = await token.balanceOf(trader)
            assert.equal(traderBalance.toString(),  tokens('10'))

            let xchangeBalance 
            //see if exchange lost tokens
            xchangeBalance = await token.balanceOf(xchange.address)
            assert.equal(xchangeBalance.toString(), tokens('999990'))
            //see if exchange gained eth
            xchangeBalance = await web3.eth.getBalance(xchange.address)
            assert.equal(xchangeBalance.toString(), web3.utils.toWei('1', 'Ether'))

            const event = result.logs[0].args
            
            assert.equal(event.account, trader)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('10').toString())
            assert.equal(event.rate.toString(), '10')
        })
    })
    
    
    describe('Selling Tokens Function [sell()]', async() => {
        let result
        
        before(async() => {
            //trader must approve the purchase
            await token.approve(xchange.address, tokens('10'), {from: trader})
            result = await xchange.sell(tokens('10'), {from: trader})
        })
        it('Allows user to sell Supra tokens to the exchange', async() => {
            let traderBalance = await token.balanceOf(trader)
            assert.equal(traderBalance.toString(),  tokens('0'))
            
            let xchangeBalance 
            //see if exchange lost tokens
            xchangeBalance = await token.balanceOf(xchange.address)
            assert.equal(xchangeBalance.toString(), tokens('1000000'))
            //see if exchange gained eth
            xchangeBalance = await web3.eth.getBalance(xchange.address)
            assert.equal(xchangeBalance.toString(), web3.utils.toWei('0', 'Ether'))
            
            const event = result.logs[0].args

            assert.equal(event.account, trader)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('10').toString())
            assert.equal(event.rate.toString(), '10')

            //can't sell more tokens that they have
            await xchange.sell(tokens('500'), {from: trader}).should.be.rejected
        })
    })
})