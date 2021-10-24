import React, { Component } from 'react'
import Web3 from 'web3'

import Xchange from "../abis/Xchange.json"
import Token from "../abis/Token.json"

import Navbar from './Navbar'
import Exchange from './Exchange'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })
    console.log(this.state.account)

    const networkId = await web3.eth.net.getId()
    //loading Token [Supra]
    const abi     = Token.abi
    //getting network id from metamask
    const tokenData = Token.networks[networkId]

    if(tokenData) {
      const address = tokenData.address
      const token   = new web3.eth.Contract(abi, address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      console.log(tokenBalance.toString());
      this.setState({ tokenBalance: tokenBalance.toString() })
    }
    else {
      alert("Token not deployed to current network")
    }
    
    //Loading Xchange
    //getting network id from metamask
    const xhcnageData = Xchange.networks[networkId]
    
    if(xhcnageData) {
      const address = xhcnageData.address
      const xchange   = new web3.eth.Contract(Xchange.abi, address)
      this.setState({ xchange })
      console.log(this.state.xchange);
      
      // let tokenBalance = await token.methods.balanceOf(this.state.account).call()

      // this.setState({ tokenBalance: tokenBalance.toString() })
    }
    else {
      alert("Xchange contract not deployed to current network")
    }

    this.setState({loading: false})
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account       : '',
      ethBalance    : '0',
      token         : {},
      tokenBalance  : '0',
      xchange       : {},
      xchangeBalance: '0',
      loading       : true
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({loading: true})
    this.state.xchange.methods.buy().send({value: etherAmount, from: this.state.account})
                            .on('transactionHash', (hash) => {
                              this.setState({loading: false})
                            })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.xchange.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      console.log("approval done");
      this.state.xchange.methods.sell(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  render() {
    let content
    if (this.state.loading) {
      content = <p>Content is loading</p>
    } else {
      content = <Exchange 
                  ethBalance={this.state.ethBalance} 
                  tokenBalance={this.state.tokenBalance}
                  buyTokens={this.buyTokens}
                  sellTokens={this.sellTokens}
                />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <br/>
        <br/>
        {/* <br/>
        <br/>
        <br/>
        <br/> */}
        {content}


      </div>
    );
  }
}

export default App;
