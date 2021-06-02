import { IMessagingService } from '../..';
import { getWeb3 } from './web3Utils';

import {
  ChatMessage,
  getStatusFleetNodes,
  Environment,
  StoreCodec,
  Waku,
  WakuMessage,
} from "js-waku";


const POW_TIME = process.env.WHISPER_POW_TIME || 100;
const TTL = process.env.WHISPER_TTL || 20;
const POW_TARGET = process.env.WHISPER_POW_TARGET || 2;


// note: no encryption is done by the API, it provides a lightweight wrapper to waku
// messages are sent as-is across the wire (we still apply encryption on the channel)
// encryption needs to be managed by the client

function getNodes() {
  // Works with react-scripts
  if (process?.env?.NODE_ENV === 'development') {
    return getStatusFleetNodes(Environment.Test);
  } else {
    return getStatusFleetNodes(Environment.Prod);
  }
}

export class WakuService implements IMessagingService {
  public keyId: string;
  private clientUrl: string;
  private service?: Waku | null;
  private listenerMap: {};

  constructor(
    private readonly config,
  ) {
    this.keyId = config.keyId;
    this.clientUrl = config.clientUrl;
    this.listenerMap = {};
  }

  getSubscribedSubjects(): string[] {
    throw new Error('Method not implemented.');
  }

  async connect(): Promise<void> {
    console.log("Connection started - waku service");
    try {
      this.service = await Waku.create({
        config: {
          pubsub: {
            enabled: true,
            emitSelf: true,
          },
        },
      });

      console.log("Connected, getting nodes");

      const nodes = await getNodes();
      console.log("Got nodes, dialing and return");
      await Promise.all(
        nodes.map((addr) => {
          console.log("Dialing", addr);
          return this.service?.dial(addr);
        })
      );
    } catch (e) {
      console.log('Issue starting waku ', e);
    }
    console.log("Connection completed!");
  }

  disconnect(): Promise<void> {
    if (this.service) {
      this.service.libp2p.peerStore.removeAllListeners();
      this.service = null;
    }
    return Promise.resolve();
  }

  isConnected(): boolean {
    return this.service !== null;
  }

  async publish(subject: string,
    data: any,
    reply: any,
    recipientId: string,
    senderId: string): Promise<any> {
    // this.service!.publish(subject, data);
    console.log("publishing", subject, data)
    console.log("Receipt", recipientId, senderId);
    let content = data;
    if (typeof data === "object") {
      content = JSON.stringify(data);
    }
    else if (typeof data !== "string") {
      content = "" + data;
    }

    let keyId = this.keyId;
    if (senderId) {
      keyId = senderId;
    }

    const messageObj = {
      pubKey: recipientId,
      sig: keyId,
      ttl: TTL,
      topic: subject,
      payload: content,
      powTime: POW_TIME,
      powTarget: POW_TARGET,
    };
    const web3 = await getWeb3(this.clientUrl);

    const hash = web3.utils.sha3(JSON.stringify(messageObj));
    const time = Math.floor(Date.now() / 1000);
    const publicKey = senderId;

    const result = {
      payload: content,
      _id: hash,
      hash,
      recipientPublicKey: recipientId,
      sig: publicKey,
      ttl: messageObj.ttl,
      topic: messageObj.topic,
      pow: POW_TARGET,
      timestamp: time
    };
    const chatMessage = ChatMessage.fromUtf8String(new Date(), keyId, JSON.stringify(result));
    const wakuMsg = WakuMessage.fromBytes(chatMessage.encode(), subject);
    this.service?.relay.send(wakuMsg);
    console.log("SENT", result);

    return result;
  }

  async request(subject: string, timeout: number, data: object = {}): Promise<any> {
    // const response = await this.service!.request(subject, timeout, data);
    // return response;
    throw new Error('Method not implemented.');
  }

  async subscribe(
    subject: string,
    callback: (msg: any, err?: any) => void,
  ): Promise<void> {
    // await this.service!.subscribe(subject, (msg: any, err?: any): void => {
    //   callback(msg, err);
    // });
    this.service?.relay.addObserver((message: WakuMessage) => {
      if (message.payload) {
        const msg = ChatMessage.decode(message.payload);
        if (msg) {
          //   const { hash, recipientPublicKey, sig, ttl, topic, pow, timestamp } = messageData;
          const obj = JSON.parse(msg.payloadAsUtf8);
          
          callback.call(this, obj);
        }
        else {
          // error
          callback.call(this, message.payload, "Failed - msg could not be decoded!");
        }
      }
    }, [subject]);
    if (!this.listenerMap[subject]) {
      this.listenerMap[subject] = [];
    }
    this.listenerMap[subject].push(callback);
  }

  async unsubscribe(subject: string): Promise<void> {
    console.log("unsubscribing from topic", subject);
    if (this.listenerMap[subject]) {
      this.listenerMap[subject].forEach(listener => this.service?.relay.removeListener(subject, listener));
    }
    delete this.listenerMap[subject];
  }

  async flush(): Promise<void> {
    // await this.service!.flush();
    console.log("flush is called");
  }
  // Load any previously created Whisper IDs from database into Whisper node
  // If no existing IDs provided, create a new one
  async loadIdentities(identities, topic = DEFAULT_TOPIC, callback) {
    const loadedIds = await new Array<object>();
    if (identities.length === 0) {
      const newId = await this.createIdentity(topic, callback)
      loadedIds.push(newId);
    } else {
      const web3 = await getWeb3(this.clientUrl);
      await Promise.all(identities.map(async id => {
        try {
          const keyId = await web3.shh.addPrivateKey(id.privateKey);
          const publicKey = await web3.shh.getPublicKey(keyId);
          loadedIds.push({ publicKey, keyId });
          await this.subscribe(topic, callback);
        } catch (err) {
          logger.error(
            `Error adding public key ${id.publicKey} to Whisper node: ${err}`,
          );
        }
      }));
    };
    console.log("Loaded Identities", loadedIds);
    this.keyId = loadedIds[0]['keyId'];
    return loadedIds;
  }

  async createIdentity(topic = DEFAULT_TOPIC, callback) {
    // Create new public/private key pair
    const web3 = await getWeb3(this.clientUrl);
    const keyId = await web3.shh.newKeyPair();
    const publicKey = await web3.shh.getPublicKey(keyId);
    const privateKey = await web3.shh.getPrivateKey(keyId);
    const createdDate = await Math.floor(Date.now() / 1000);

    await this.subscribe(topic, callback);
    this.keyId = keyId;
    return { publicKey, privateKey, keyId, createdDate };
  }
}
