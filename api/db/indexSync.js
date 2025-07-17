const mongoose = require('mongoose');
const { MeiliSearch } = require('meilisearch');
const { logger } = require('@openbiocure/data-schemas');
const { FlowStateManager } = require('@openbiocure/api');
const { CacheKeys } = require('openbiocure-data-provider');

const { isEnabled } = require('~/server/utils');
const { getLogStores } = require('~/cache');

const Conversation = mongoose.models.Conversation;
const Message = mongoose.models.Message;

const searchEnabled = isEnabled(process.env.SEARCH);
const indexingDisabled = isEnabled(process.env.MEILI_NO_SYNC);
let currentTimeout = null;

class MeiliSearchClient {
  static instance = null;

  static getInstance() {
    logger.info('[MeiliSearchClient] getInstance() called');
    logger.info(`[MeiliSearchClient] MEILI_HOST: ${process.env.MEILI_HOST || 'NOT SET'}`);
    logger.info(`[MeiliSearchClient] MEILI_MASTER_KEY: ${process.env.MEILI_MASTER_KEY ? 'SET' : 'NOT SET'}`);
    
    if (!MeiliSearchClient.instance) {
      logger.info('[MeiliSearchClient] Creating new MeiliSearch instance');
      if (!process.env.MEILI_HOST || !process.env.MEILI_MASTER_KEY) {
        logger.error('[MeiliSearchClient] Missing configuration - MEILI_HOST or MEILI_MASTER_KEY not set');
        throw new Error('Meilisearch configuration is missing.');
      }
      
      try {
        MeiliSearchClient.instance = new MeiliSearch({
          host: process.env.MEILI_HOST,
          apiKey: process.env.MEILI_MASTER_KEY,
        });
        logger.info('[MeiliSearchClient] MeiliSearch instance created successfully');
      } catch (error) {
        logger.error('[MeiliSearchClient] Failed to create MeiliSearch instance:', error.message);
        throw error;
      }
    } else {
      logger.info('[MeiliSearchClient] Returning existing instance');
    }
    return MeiliSearchClient.instance;
  }
}

/**
 * Performs the actual sync operations for messages and conversations
 */
async function performSync() {
  logger.info('[performSync] Starting performSync function');
  
  try {
    logger.info('[performSync] Getting MeiliSearch client instance...');
    const client = MeiliSearchClient.getInstance();
    logger.info('[performSync] MeiliSearch client obtained successfully');

    logger.info('[performSync] Checking MeiliSearch health...');
    const { status } = await client.health();
    logger.info(`[performSync] Health check result: ${status}`);
    
    if (status !== 'available') {
      logger.error(`[performSync] MeiliSearch not available, status: ${status}`);
      throw new Error('Meilisearch not available');
    }
    logger.info('[performSync] MeiliSearch health check passed');
  } catch (error) {
    logger.error('[performSync] Error in performSync:', error.message);
    logger.error('[performSync] Error stack:', error.stack);
    throw error;
  }

  if (indexingDisabled === true) {
    logger.info('[indexSync] Indexing is disabled, skipping...');
    return { messagesSync: false, convosSync: false };
  }

  let messagesSync = false;
  let convosSync = false;

  // Check if we need to sync messages
  const messageProgress = await Message.getSyncProgress();
  if (!messageProgress.isComplete) {
    logger.info(
      `[indexSync] Messages need syncing: ${messageProgress.totalProcessed}/${messageProgress.totalDocuments} indexed`,
    );

    // Check if we should do a full sync or incremental
    const messageCount = await Message.countDocuments();
    const messagesIndexed = messageProgress.totalProcessed;
    const syncThreshold = parseInt(process.env.MEILI_SYNC_THRESHOLD || '1000', 10);

    if (messageCount - messagesIndexed > syncThreshold) {
      logger.info('[indexSync] Starting full message sync due to large difference');
      await Message.syncWithMeili();
      messagesSync = true;
    } else if (messageCount !== messagesIndexed) {
      logger.warn('[indexSync] Messages out of sync, performing incremental sync');
      await Message.syncWithMeili();
      messagesSync = true;
    }
  } else {
    logger.info(
      `[indexSync] Messages are fully synced: ${messageProgress.totalProcessed}/${messageProgress.totalDocuments}`,
    );
  }

  // Check if we need to sync conversations
  const convoProgress = await Conversation.getSyncProgress();
  if (!convoProgress.isComplete) {
    logger.info(
      `[indexSync] Conversations need syncing: ${convoProgress.totalProcessed}/${convoProgress.totalDocuments} indexed`,
    );

    const convoCount = await Conversation.countDocuments();
    const convosIndexed = convoProgress.totalProcessed;
    const syncThreshold = parseInt(process.env.MEILI_SYNC_THRESHOLD || '1000', 10);

    if (convoCount - convosIndexed > syncThreshold) {
      logger.info('[indexSync] Starting full conversation sync due to large difference');
      await Conversation.syncWithMeili();
      convosSync = true;
    } else if (convoCount !== convosIndexed) {
      logger.warn('[indexSync] Convos out of sync, performing incremental sync');
      await Conversation.syncWithMeili();
      convosSync = true;
    }
  } else {
    logger.info(
      `[indexSync] Conversations are fully synced: ${convoProgress.totalProcessed}/${convoProgress.totalDocuments}`,
    );
  }

  return { messagesSync, convosSync };
}

/**
 * Main index sync function that uses FlowStateManager to prevent concurrent execution
 */
async function indexSync() {
  logger.info('[indexSync] indexSync function called');
  logger.info(`[indexSync] searchEnabled: ${searchEnabled}`);
  logger.info(`[indexSync] indexingDisabled: ${indexingDisabled}`);
  
  if (!searchEnabled) {
    logger.info('[indexSync] Search is disabled, returning early');
    return;
  }

  logger.info('[indexSync] Starting index synchronization check...');

  try {
    logger.info('[indexSync] Getting flows cache...');
    // Get or create FlowStateManager instance
    const flowsCache = getLogStores(CacheKeys.FLOWS);
    if (!flowsCache) {
      logger.warn('[indexSync] Flows cache not available, falling back to direct sync');
      return await performSync();
    }
    logger.info('[indexSync] Flows cache obtained successfully');

    const flowManager = new FlowStateManager(flowsCache, {
      ttl: 60000 * 10, // 10 minutes TTL for sync operations
    });

    // Use a unique flow ID for the sync operation
    const flowId = 'meili-index-sync';
    const flowType = 'MEILI_SYNC';

    // This will only execute the handler if no other instance is running the sync
    const result = await flowManager.createFlowWithHandler(flowId, flowType, performSync);

    if (result.messagesSync || result.convosSync) {
      logger.info('[indexSync] Sync completed successfully');
    } else {
      logger.debug('[indexSync] No sync was needed');
    }

    return result;
      } catch (err) {
      logger.error('[indexSync] Caught error in indexSync:', err.message);
      logger.error('[indexSync] Error type:', err.constructor.name);
      logger.error('[indexSync] Full error:', err);
      
      if (err.message.includes('flow already exists')) {
        logger.info('[indexSync] Sync already running on another instance');
        return;
      }

      if (err.message.includes('not found')) {
        logger.debug('[indexSync] Creating indices...');
        currentTimeout = setTimeout(async () => {
          try {
            await Message.syncWithMeili();
            await Conversation.syncWithMeili();
          } catch (err) {
            logger.error('[indexSync] Trouble creating indices, try restarting the server.', err);
          }
        }, 750);
      } else if (err.message.includes('Meilisearch not configured')) {
        logger.info('[indexSync] Meilisearch not configured, search will be disabled.');
      } else if (err.message.includes('fetch failed')) {
        logger.error('[indexSync] Network error - fetch failed. This might be a connection issue.');
        logger.error('[indexSync] Check if MeiliSearch is reachable from this server.');
      } else {
        logger.error('[indexSync] Unexpected error:', err);
      }
    }
}

process.on('exit', () => {
  logger.debug('[indexSync] Clearing sync timeouts before exiting...');
  clearTimeout(currentTimeout);
});

module.exports = indexSync;
