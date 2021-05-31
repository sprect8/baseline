import { messagingProviderWaku, messagingServiceFactory } from '../src/index';
import { promisedTimeout } from './utils';

let wakuService;
const callback = () => { };

const wakuServiceFactory = async (cfg) => {
  return await messagingServiceFactory(messagingProviderWaku, cfg);
};

const requireWakuConnection = async () => {
  expect(wakuService.isConnected()).toBe(false);
  const conn = await wakuService.connect();
  await wakuService.connect();
  for (let retry = 0; retry < 5; retry++) {
    if (wakuService.web3Connected) {
      break;
    }
    await promisedTimeout(1000);
  }
  expect(wakuService.isConnected()).toBe(true);
  return conn;
};

beforeEach(async () => {
  wakuService = await wakuServiceFactory({
    clientUrl: 'ws://localhost:8546',
  });
  expect(wakuService).not.toBe(null);
});

afterEach(async () => {
  if (wakuService.isConnected()) {
    wakuService.disconnect();
  }
});

describe('connect', () => {
  it('should establish and return a waku connection', async () => {
    const conn = await wakuService.connect();
    expect(conn).not.toBe(null);
  });

  it('should cache the waku connection for subsequent use by the service', async () => {
    await requireWakuConnection();
  });
});

describe('disconnect', () => {
  describe('when the waku service has an active underlying connection', () => {
    beforeEach(async () => {
      await requireWakuConnection();
      wakuService.disconnect();
      await promisedTimeout(1000);
    });

    it('should gracefully close the waku connection', async () => {
      expect(wakuService.isConnected()).toBe(false);
    });
  });
});

describe('publish', () => {
  let identity;
  beforeEach(async () => {
    identity = await wakuService.createIdentity(undefined, callback);
  });

  describe('when the waku service has an active underlying connection', () => {
    let subject;

    beforeEach(async () => {
      await requireWakuConnection();
      subject = `hello.world.${new Date().getTime()}`;
    });

    describe('when no reply subject is provided', () => {
      it('should publish message', async () => {
        const res = await wakuService.publish(undefined, '0x01', undefined, identity.publicKey, identity.keyId);
        expect(res.payload).toBe('0x01');
      });
    });
  });
});

describe('subscribe', () => {
  describe('when the waku service has an active underlying connection', () => {
    let subscription;
    let identity;

    beforeEach(async () => {
      await requireWakuConnection();
      identity = await wakuService.createIdentity(undefined, callback);
      subscription = await wakuService.subscribe(undefined, callback, identity.keyId);
    });

    it('should return the new subscription', async () => {
      expect(subscription).not.toBe(null);
    });
  });
});
