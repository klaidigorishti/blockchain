class Block {
    constructor(index, previousHash, timestamp, data, hash, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.nonce = nonce;
    }

    static get genesis() {
        // Create the Genesis (first) Block of the Blockchain with the index 0
        return new Block(
            0,
            "0",
            1508270000000,
            "Genesis Block",
            "000c6d1d8352b7ecbfbbb1d28201cacb7f12a534476b2c360eb38e0fdf5083b6",
            2503
        );
    }
}

module.exports = Block;
