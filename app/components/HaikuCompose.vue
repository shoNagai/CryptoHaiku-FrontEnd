<template lang="html">
  <div class="container">
    <div class="columns is-mobile is-multiline is-centered">
      <div class="field"> 
        <canvas id="cv1" width="480" height="480"></canvas>
        <div class="file is-info"> <label class="file-label">
          <input class="file-input" @change="fileChange" ref="file" type="file" name="resume">
          <span class="file-cta">
            <span class="file-label">Select Image</span>
          </span>
          </label> 
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-body">
          <div class="field">
            <div class="control"> <textarea class="input" name="content" id="content" v-model="content"/> </div>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-body">
          <div class="field">
            <div class="control"> <button class="button is-info" @click="insertTextDataToImage">generate</button> </div>
          </div>
          <div class="field">
            <div class="control"> <button class="button is-primary" @click="haikuCompose">Compose</button> </div>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-body">
          <p class="message">{{ message }}</p>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-body"> <a target="_blank" v-bind:href="txUrl">{{txHash}}</a> </div>
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
const RESIZE_WIDTH = 480;
const RESIZE_HEIGHT = 480;
let canvas = null;
let ctx = null;
export default {
  name: 'HaikuCompose',
  data() {
    return {
      isNetwork: true,
      content: null,
      txHash: null,
      txUrl: null,
      message: null,
      account: null,
      contractAddress: null,
      file: null,
      buffer: null,
      ipfsHash: null,
      reader: null,
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
      HaikuToken.deployed().then((instance) => instance.address).then((address) => {
        this.contractAddress = address
      })
    })
  },
  mounted() {
    canvas = document.getElementById("cv1");
    ctx = canvas.getContext("2d");
    if (screen.width < 860) {
      canvas.width = 700 * screen.width / 860;
    }
  },
  methods: {
    async haikuCompose() {
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
      }).catch((e) => {
        // console.error(e)
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
        ipfs.files.add({ 
        path: this.file.name,
        content: this.buffer
        }, (err, ipfsHash) => {
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
          maxHeight: 1024,
          maxWidth: 1024,
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
    insertTextDataToImage() {
      var txt = document.getElementById("content");
      ctx.font = 'bold 32px MS PGothic';
      ctx.fillStyle = 'white';
      this.verticalInput(ctx, txt.value, 150, 50);
    },
    verticalInput(ctx, text, x, y) {
      var textList = text.split('\n');
      var lineHeight = ctx.measureText("あ").width;
      textList.forEach(function (elm, i) {
        Array.prototype.forEach.call(elm, function (ch, j) {
          ctx.fillText(ch, x - lineHeight * i, y + lineHeight * j);
        });
      });
    }
  }
}
</script>