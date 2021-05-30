import { IMessagingService } from '../..';
import PeerId from "peer-id";
import {
  ChatMessage,
  getStatusFleetNodes,
  Environment,
  StoreCodec,
  Waku,
  WakuMessage,
} from "js-waku";

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

  private service?: Waku | null;
  private listenerMap: {};

  constructor(
    private readonly config,
  ) {
    this.listenerMap = {};
  }

  getSubscribedSubjects(): string[] {
    throw new Error('Method not implemented.');
  }

  async connect(): Promise<void> {
    try {
      this.service = await Waku.create({
        config: {
          pubsub: {
            enabled: true,
            emitSelf: true,
          },
        },
      });
    
      const nodes = await getNodes();
      await Promise.all(
        nodes.map((addr) => {
          return this.service?.dial(addr);
        })
      );
    } catch (e) {
      console.log('Issue starting waku ', e);
    }
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

  async publish(subject: string, data: any): Promise<void> {
    // this.service!.publish(subject, data);
    const chatMessage = ChatMessage.fromUtf8String(new Date(), "baseline", data);
    const wakuMsg = WakuMessage.fromBytes(chatMessage.encode(), subject);
    this.service?.relay.send(wakuMsg);
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
          callback(msg);
        }
        else {
          // error
          callback(msg, "Failed - msg could not be decoded!");
        }
      }
    }, [subject]);
    if (!this.listenerMap[subject]) {
      this.listenerMap[subject] = [];
    }
    this.listenerMap[subject].push(callback);
  }

  async unsubscribe(subject: string): Promise<void> {
    if (this.listenerMap[subject]) {
      this.listenerMap[subject].forEach(listener => this.service?.relay.removeListener(subject, listener));
    }
    delete this.listenerMap[subject];
  }

  async flush(): Promise<void> {
    // await this.service!.flush();
    console.log("flush is called");
  }
}
