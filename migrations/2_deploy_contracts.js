const Token = artifacts.require("Token");
const Xchange = artifacts.require("Xchange");

module.exports = async function(deployer) {
    await deployer.deploy(Token);
    const token = await Token.deployed()
    
    await deployer.deploy(Xchange, token.address);
    const xchange = await Xchange.deployed()

    //Transfer all generated tokens to Our exchange
    await token.transfer(xchange.address, '1000000000000000000000000')
};
