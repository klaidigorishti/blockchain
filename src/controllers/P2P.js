const wrtc = require("wrtc");
const exchange = require("peer-exchange");
const net = require("net");
const messageType = require("../models/messageType");
const messages = require("../models/messages");
const p2p = new exchange("Blockchain", { wrtc: wrtc });
const {
    REQUEST_LATEST_BLOCK,
    RECEIVE_LATEST_BLOCK,
    REQUEST_BLOCKCHAIN,
    RECEIVE_BLOCKCHAIN,
    REQUEST_TRANSACTIONS,
    RECEIVE_TRANSACTIONS
} = messageType;

class PeerToPeer {

    constructor(blockchain) {
        this.peers = [];
        this.blockchain = blockchain;
    }

    startServer(port) {
        const server = net
            .createServer( socket =>
            p2p.accept(socket, (err, conn) => {
                if (err) {
                    throw err;
                } else {
                    this.initConnection.call(this, conn);
                }
            })
            )
            .listen(port);
    }

    discoverPeers() {
        p2p.getNewPeer((err, conn) => {
            if (err) {
                throw err;
            } else {
                this.initConnection.call(this, conn);
            }
        });
    }

    connectToPeer(host, port) {
        const socket = net.connect(port, host, () =>
            p2p.connect(socket, (err, conn) => {
                if (err) {
                    throw err;
                } else {
                    this.initConnection.call(this, conn);
                }
            })
        );
    }

    closeConnection() {
        p2p.close(err => {
            throw err;
        });
    }

    broadcastLatest() {
        this.broadcast(messages.sendLatestBlock(this.blockchain.latestBlock));
    }

    broadcast(message) {
        this.peers.forEach(peer => this.write(peer, message));
    }

    write(peer, message) {
        peer.write(JSON.stringify(message));
    }

    initConnection(connection) {
        this.peers.push(connection);
        this.initMessageHandler(connection);
        this.initErrorHandler(connection);
        this.write(connection, messages.getLatestBlock());
    }

    initMessageHandler(connection) {
        connection.on("data", data => {
            const message = JSON.parse(data.toString("utf8"));
            this.handleMessage(connection, message);
        });
    }

    initErrorHandler(connection) {
        connection.on("error", err => {
            throw err;
        });
    }

    handleMessage(peer, message) {
        switch (message.type) {
            case REQUEST_LATEST_BLOCK:
                this.write(peer, messages.sendLatestBlock(this.blockchain.latestBlock));
                break;
            case REQUEST_BLOCKCHAIN:
                this.write(peer, messages.sendBlockchain(this.blockchain.get()));
                break;
            case RECEIVE_LATEST_BLOCK:
                this.handleReceivedLatestBlock(message, peer);
                break;
            case RECEIVE_BLOCKCHAIN:
                this.handleReceivedBlockchain(message);
                break;
            default:
                throw "Received invalid message.";
        }
    }

    handleReceivedLatestBlock(message, peer) {
        const receivedBlock = message.data;
        const latestBlock = this.blockchain.latestBlock;

        if (latestBlock.hash === receivedBlock.previousHash) {
            try {
                this.blockchain.addBlock(receivedBlock);
            } catch(err) {
                throw err;
            }
        } else if (receivedBlock.index > latestBlock.index) {
            this.write(peer, messages.getBlockchain());
        } else {
            // Do nothing.
        }
    }

    handleReceivedBlockchain(message) {
        const receivedChain = message.data;

        try {
            this.blockchain.replaceChain(receivedChain);
        } catch(err) {
            throw err;
        }
    }
}

module.exports = PeerToPeer;