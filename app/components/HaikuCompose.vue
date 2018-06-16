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
    <div class="container has-text-centered column is-4">
      <center v-if="isNetwork">
        <h4 class="title is-4">Publish Your Haiku</h4>
      </center>
      <div v-if="message" class="content has-text-centered">
        <div class="notification is-info">・{{message}}</div>
      </div>
      <div v-if="errormessage" class="content has-text-centered">
        <div class="notification is-danger">・{{errormessage}}</div>
      </div>
      <div>
        <canvas id="cv1" class="haiku" width="200" height="280"></canvas>
      </div>
      <div v-if="isNetwork" class="field is-mobile is-multiline is-centered">
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field">
              <div class="control">
                <textarea id="content" class="textarea" maxlength="20" placeholder="haiku...20 characters"
                 v-model="content" rows="3" @change="convertTextToImage"></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field">
            <div class="control">
              <button v-bind:disabled="!isNetwork" class="button" @click="haikuPublish">
                publish
              </button>
            </div>
          </div>
          <div class="field">
            <p class="control">
              <button class="button" @click="clear">clear</button>
            </p>
          </div>
          <div class="field">
            <div class="file is-normal control">
              <label class="file-label">
                <input class="file-input" type="file" name="resume" @change="fileChange">
                <span class="file-cta">
                  <span class="file-label">
                    set image
                  </span>
                </span>
              </label>
            </div>
          </div>
          <div class="field">
            <p class="control">
              <button class="button" @click="convertTextToImage">generate</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'
import IPFS from "ipfs-api"
import loadImage from 'blueimp-load-image'
import artifacts from '../../build/contracts/HaikuToken.json'
const HaikuToken = contract(artifacts)
const ipfsConf = {
  host: process.env.IPFSHOST,
  port: process.env.IPFSPORT,
  protocol: process.env.IPFSPROTOCOL
}
const ipfs = new IPFS(ipfsConf)
const RESIZE_WIDTH = 200;
const RESIZE_HEIGHT = 280;
let canvas = null;
let ctx = null;
export default {
  name: 'HaikuCompose',
  data() {
    return {
      isNetwork: false,
      content: null,
      txHash: null,
      txUrl: null,
      message: null,
      errormessage: null,
      account: null,
      contractAddress: null,
      file: null,
      buffer: null,
      ipfsHash: null,
      reader: null,
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
      HaikuToken.deployed().then((instance) => instance.address).then((address) => {
        this.contractAddress = address
      })
    })
    canvas = document.getElementById("cv1");
    if (canvas.getContext){
      ctx = canvas.getContext("2d");
    }
  },
  methods: {
    async haikuPublish() {
      this.message = "Transaction started";
      await this.saveImageDataFromCanvas()
      await this.convertToBuffer()
      await this.saveIpfs()
      await HaikuToken.deployed().then((instance) => instance.mint(this.content, this.ipfsHash, {
        from: this.account
      })).then((result) => {
        this.message = "Transaction result"
        this.txHash = result.tx
        this.txUrl = process.env.TXURL + result.tx
        this.content = null
        this.file = null
        this.buffer = null
        this.ipfsHash = null
        this.reader = null
        this.clear();
      }).catch((e) => {
        this.message = "Transaction failed"
      })
    },
    saveImageDataFromCanvas() {
      return new Promise((resolve) => {
        var type = process.env.IMAGETYPE;
        var dataurl = canvas.toDataURL(type);
        var bin = atob(dataurl.split(',')[1]);
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i);
        }
        var blob = new Blob([buffer.buffer], {type: type});
        this.reader = new window.FileReader()
        this.reader.readAsArrayBuffer(blob)
        this.reader.onloadend = function (event) {
          resolve(this.reader)
        }
      })
    },
    convertToBuffer() {
      return new Promise((resolve) => {
        //converted to a buffer for upload to IPFS
        const buffer = Buffer.from(this.reader.result);
        this.buffer = buffer;
        resolve(this.buffer)
      })
    },
    saveIpfs() {
      return new Promise((resolve) => {
        ipfs.add(this.buffer, (err, ipfsHash) => {
          if (err) {
            console.log(err)
          } else {
            this.ipfsHash = ipfsHash[0].hash;
            resolve(this.ipfsHash)
          }
        })
      })
    },
    fileChange(event) {
      this.file = event.target.files[0]
      if (!this.file.type.startsWith('image/')) {
        return;
      }
      loadImage.parseMetaData(this.file, (data) => {
        const options = {
          maxHeight: 280,
          maxWidth: 200,
          canvas: true
        };
        if (data.exif) {
          options.orientation = data.exif.get('Orientation');
        }
        loadImage(this.file, (canvas) => {
          var image = new Image();
          image.onload = function () {
            var width, height;
            if (image.width > image.height) {
              var ratio = image.height / image.width;
              width = RESIZE_WIDTH;
              height = RESIZE_WIDTH * ratio;
            } else {
              var ratio = image.width / image.height;
              width = RESIZE_HEIGHT * ratio;
              height = RESIZE_HEIGHT;
            }
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
          }
          image.src = canvas.toDataURL('image/png');
        }, options);
      });
    },
    convertTextToImage() {
      var txt = document.getElementById("content");
      ctx.font = "bold 25px 'HG正楷書体-PRO'";
      if(this.file){
        ctx.fillStyle = '#FFFFFF';
      }else {
        ctx.fillStyle = '#000000';
      }
      this.verticalInput(ctx, txt.value, 130, 40);
    },
    verticalInput(ctx, text, x, y) {
      var textList = text.split('\n');
      var lineHeight = ctx.measureText("あ").width;
      textList.forEach(function (elm, i) {
        Array.prototype.forEach.call(elm, function (ch, j) {
          ctx.fillText(ch, x - lineHeight * i, y + lineHeight * j);
        });
      });
    },
    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}
</script>

<style>
.haiku {
  letter-spacing: 10px;
  margin: 5px;
  border-style: solid;
  border-color:rgba(66, 64, 64, 0.089);
}
.control {
  margin: 3px;
}
</style>