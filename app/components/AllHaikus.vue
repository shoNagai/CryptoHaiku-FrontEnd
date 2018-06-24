<template lang="html">
  <div class="container has-text-centered">
    <div v-if="!isNetwork">
      <h4 class="title is-4">Network Infomation</h4>
      <p v-if="!isNetwork">This Network is Not Rinkeby!</p>
      <p v-if="!isNetwork">Please check your MetaMask!</p>
      <p v-if="contractAddress && isNetwork">This contract is deployed at {{contractAddress}}</p>
      <p v-if="account && isNetwork">Current address: {{account}}</p>
      <p v-if="!account && isNetwork">No accounts found</p>
    </div>
    <div v-if="isNetwork" class="container has-text-centered column is-12">
      <h4 class="title is-4">All Haikus</h4>
      <div class="columns is-mobile is-multiline is-centered">
        <div class="column is-narrow" v-for="haiku in allHaikus" :key="haiku.id">
          <div class="card haiku-card">
            <div class="message-header">
              <p>#{{haiku.tokenId}}</p>
            </div>
            <div class="card-content">
              <img :src="tokenImage(haiku)">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'
import artifacts from '../../build/contracts/HaikuToken.json'
const HaikuToken = contract(artifacts)

export default {
  name: 'AllHaikus',
  data() {
    return {
      isNetwork: false,
      allHaikus: [],
      message: null,
      account: null,
      contractAddress: null,
    }
  },
  async mounted() {
    web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    HaikuToken.setProvider(web3.currentProvider)
    const networkId = await web3.eth.net.getId();
    web3.eth.getAccounts((err, accs) => {
      if (networkId !== Number(process.env.NETWORKID)) {
        this.isNetwork = false
      } else {
        this.isNetwork = true
      }
      if (err != null) {
        console.log(err)
        this.message = "There was an error fetching your accounts. Do you have Metamask, Mist installed or an Ethereum node running? If not, you might want to look into that"
        return
      }
      if (accs.length == 0) {
        this.message = "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        return
      }
      this.account = accs[0];
      HaikuToken.deployed()
        .then((instance) => instance.address)
        .then((address) => {
          this.contractAddress = address
          this.getAllHaikus();
        })
    })
  },
  methods: {
    getAllHaikus() {
      HaikuToken.deployed().then((instance) => instance.getAllHaikus()).then((result) => {
        for (var i = 0; i < result.length; i++) {
          this.getHaiku(result[i])
        }
      })
    },
    getHaiku(tokenId) {
      HaikuToken.deployed()
      .then((instance) => instance.getHaiku(tokenId, { from: this.account }))
      .then((result) => {
        var haiku = {
          "tokenId": null,
          "content": null,
          "mintAddr": null,
          "mintTime": null,
          "tokenUri": null,
        }
        haiku.tokenId = Number(tokenId)
        haiku.content = result[0].toString()
        haiku.mintAddr = result[1].toString()
        haiku.mintTime = result[2].toString()
        haiku.tokenUri = result[3].toString()
        console.log(result[3].toString())
        this.allHaikus.push(haiku)
      })
    },
    tokenImage (haiku) {
      return 'https://gateway.ipfs.io/ipfs/' + haiku.tokenUri
    },
  }
}
</script>

<style>
.haiku-card {
  width: 250px;
  height: 360px;
  margin: 5px;
}
.haiku-card:hover { 	
  box-shadow: 0 15px 10px -5px rgba(0,0,0,.15),0 0 5px rgba(0,0,0,.1);
  transform: translateY(-4px);
  transition: 0.2s;
  background: #fff;
}
</style>