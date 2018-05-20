<template lang="html">
  <div class="container">
      <div class="columns is-mobile is-multiline is-centered">
        <div class="column is-narrow" v-for="haiku in allHaikus" :key="haiku.id">
          <figure class="image" style="width: 200px;height: 300px">
            <div class="content article-body">
              <img :src="tokenImage(haiku)">
              <p>{{ haiku.content }}</p>
            </div>
          </figure>
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
      isNetwork: true,
      allHaikus: [],
      message: null,
      account: null,
      contractAddress: null,
    }
  },
  created() {
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3 = new Web3(web3.currentProvider)
    } else {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"))
    }
    HaikuToken.setProvider(web3.currentProvider)
    web3.eth.getAccounts((err, accs) => {
      if (web3.currentProvider.publicConfigStore._state.networkVersion !== process.env.NETWORKID) {
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
        haiku.tokenId = tokenId
        haiku.content = result[0].toString()
        haiku.mintAddr = result[1].toString()
        haiku.mintTime = result[2].toString()
        haiku.tokenUri = result[3].toString()
        this.allHaikus.push(haiku)
      })
    },
    tokenImage (haiku) {
      return 'https://gateway.ipfs.io/ipfs/' + haiku.tokenUri
    }
  }
}
</script>
