import { pubsub } from '../subscriptions';
import {
  registerToOrgRegistry,
  listOrganizations,
  getRegisteredOrganization,
  getOrganizationCount,
  getInterfaceAddress,
} from '../../services/organization';
import { getServerSettings } from '../../utils/serverSettings';
import db from '../../db';
import { logger } from 'radish34-logger';

const NEW_ORG = 'NEW_ORG';

const getOrganizationById = async address => {
  const organization = await db.collection('organization').findOne({ _id: address });
  console.log(organization, address);
  return organization;
};

const getAllOrganizations = async () => {
  const organizations = await db
    .collection('organization')
    .find({})
    .toArray();
    console.log("Organizations", organizations);
  return organizations;
};

export default {
  Query: {
    organization(_parent, args) {
      return getOrganizationById(args.address).then(res => res);
    },
    organizations() {
      return getAllOrganizations();
    },
    organizationList() {
      return listOrganizations();
    },
    registeredOrganization(_parent, args) {
      return getRegisteredOrganization(args.address);
    },
    organizationCount() {
      return getOrganizationCount();
    },
    orgRegistryAddress(_parent, args) {
      return getInterfaceAddress(args.registrarAddress, args.managerAddress, 'IOrgRegistry');
    },
  },
  Organization: {
    name: root => root.name,
    address: root => root.address,
    role: root => root.role,
  },
  Mutation: {
    registerOrganization: async (_root, args) => {
      const settings = await getServerSettings();
      console.log("register organisation");
      const { zkpPublicKey, messagingKey, messagingEndpoint, address } = settings.organization;

      const orgRegistryTxHash = await registerToOrgRegistry(
        address,
        args.organizationName,
        messagingEndpoint,
        messagingKey,
        zkpPublicKey,
        args.metadata,
      );

      logger.info(`Registering organization with tx hash: ${orgRegistryTxHash}`, { service: 'API' });
    },
  },
  Subscription: {
    newOrganization: {
      subscribe: () => {
        return pubsub.asyncIterator(NEW_ORG);
      },
    },
  },
};
