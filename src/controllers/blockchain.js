const Block = require("../models/block.js");
const crypto = require("crypto");

class Blockchain {

    constructor() {
        this.blockchain = [Block.genesis];
        this.difficulty = 3;
    }

    get() {
        return this.blockchain;
    }

    getLatestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    // Count the number of zeros in the beginning of the hash value and check if there are at least "difficulty" zeros
    isValidHashDifficulty(hash) {
        for(let i = 0; i < hash.length; i++) {
            if (hash[i] !== 0) {
                break;
            }
        }
        return i >= this.difficulty
    }

    calculateHash(index, previousHash, timestamp, data, nonce) {
        return crypto
            .createHash("sha256")
            .update(index + previousHash + timestamp + data + nonce)
            .digest("hex");

    }

    calculateBlockHash(block) {
        const { index, previousHash, timestamp, data, nonce } = block;
        return this.calculateHash(
            index,
            previousHash,
            timestamp,
            data,
            nonce
        );
    }

    generateNextBlock(data) {
        const nextIndex = this.latestBlock.index + 1;
        const previousHash = this.latestBlock.hash;
        let timestamp = new Date().getTime();
        let nonce = 0;
        let nextHash = this.calculateHash(
            nextIndex,
            previousHash,
            timestamp,
            data,
            nonce
        );

        while(!this.isValidHashDifficulty(nextHash)) {
            nonce = nonce + 1;
            timestamp = new Date().getTime();
            nextHash = this.calculateHash(
                nextIndex,
                previousHash,
                timestamp,
                data,
                nonce
            );
        }

        const nextBlock = new Block(
            nextIndex,
            previousHash,
            timestamp,
            data,
            nextHash,
            nonce
        );
    }

    mine(data) {
        const newBlock = this.generateNextBlock(data);
        try {
            this.addBlock(newBlock);
        } catch (err) {
            throw err;
        }
    }

    isValidNextBlock(nextBlock, previousBlock) {
        const nextBlockHash = this.calculateBlockHash(nextBlock);

        if (previousBlock.index + 1 !== nextBlock.index) {
            return false;
        } else if (previousBlock.hash !== nextBlock.previousHash) {
            return false;
        } else if (nextBlockHash !== nextBlock.hash) {
            return false;
        } else if (!this.isValidHashDifficulty(nextBlockHash)) {
            return false;
        } else {
            return true;
        }
    }

    addBlock(newBlock) {
        if(this.isValidNextBlock(newBlock, this.latestBlock)) {
            this.blockchain.push(newBlock);
        } else {
            throw "Error: Invalid Block!"
        }
    }

    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis)) {
            return false;
        }

        const temporaryChain = [chain[0]];
        for(let i = 1; i < chain.length; i = i + 1) {
            if (this.isValidNextBlock(chain[i], temporaryChain[i - 1])) {
                temporaryChain.push(chain[i]);
            } else {
                return false;
            }
        }
        return true;
    }

    isChainLonger(chain) {
        return chain.length > this.blockchain.length;
    }

    replaceChain(newChain) {
        if (this.isValidChain(newChain) && this.isChainLonger(newChain)) {
            this.blockchain = JSON.parse(JSON.stringify(newChain));
        } else {
            throw  "Error: Invalid Chain!"
        }
    }
}

module.exports = Blockchain;
