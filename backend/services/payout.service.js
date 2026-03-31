import { randomUUID } from 'crypto';
import pool from '../db/db.js';
import {
  readMockPayoutRequestsStore,
  writeMockPayoutRequestsStore,
  resolvePayoutRequestIdentityKeys,
  doesPayoutRequestBelongToIdentity,
  normalizeCommissionPayoutSourceKey,
  resolveCommissionPayoutSourceLabel,
  sanitizePayoutRequestRecord,
  readPayoutRequestById,
  updatePayoutRequestById,
} from '../stores/payout.store.js';
import {
  ensureWalletTables,
  upsertWalletAccount,
  lockWalletAccountsByUserIds,
  updateWalletAccountBalanceByUserId,
  insertWalletPeerTransfer,
} from '../stores/wallet.store.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function normalizePayoutRequestStatus(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'fulfilled') {
    return 'Fulfilled';
  }
  return 'Pending';
}

function normalizePayoutRequestSourceKey(value) {
  const normalized = normalizeText(value).toLowerCase();
  return normalized || 'commission';
}

function buildWalletPayoutTransferReferenceCode(prefix = 'WD') {
  const dateSegment = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const normalizedPrefix = normalizeText(prefix).toUpperCase() || 'WD';
  return `${normalizedPrefix}-${dateSegment}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

const DEFAULT_CURRENCY_CODE = 'USD';
const EWALLET_PAYOUT_SOURCE_KEY = 'ewallet';
const SYSTEM_PAYOUT_REQUEST_USER_ID = 'system-payout-request';
const SYSTEM_PAYOUT_REQUEST_USERNAME = 'Payout Request';

async function settleEWalletPayoutRequest(existingRequest, fulfillmentDetails = {}, executor) {
  await ensureWalletTables();

  const requestId = normalizeText(existingRequest?.id);
  const memberUserId = normalizeText(existingRequest?.requestedByUserId);
  if (!memberUserId) {
    return {
      success: false,
      status: 400,
      error: 'E-Wallet payout request is missing the requesting member user id.',
    };
  }

  const amount = roundCurrencyAmount(existingRequest?.amount);
  if (amount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'E-Wallet payout request amount must be greater than 0.',
    };
  }

  await upsertWalletAccount({
    userId: memberUserId,
    username: normalizeText(existingRequest?.requestedByUsername),
    email: normalizeText(existingRequest?.requestedByEmail),
    accountName: normalizeText(existingRequest?.requestedByName),
    currencyCode: DEFAULT_CURRENCY_CODE,
    startingBalance: 0,
  }, executor);

  const lockedAccounts = await lockWalletAccountsByUserIds([memberUserId], executor);
  const memberWalletAccount = lockedAccounts.find((account) => normalizeText(account?.userId) === memberUserId);
  if (!memberWalletAccount) {
    return {
      success: false,
      status: 500,
      error: 'Unable to lock member E-Wallet account for payout fulfillment.',
    };
  }

  const currentBalance = roundCurrencyAmount(memberWalletAccount.balance);
  if (currentBalance < amount) {
    return {
      success: false,
      status: 400,
      error: `Unable to fulfill payout request: E-Wallet balance is ${currentBalance.toFixed(2)} USD, but ${amount.toFixed(2)} USD is required.`,
    };
  }

  const note = normalizeText(
    fulfillmentDetails?.generalInfo
    || existingRequest?.generalInfo
    || `E-Wallet payout fulfilled (${requestId})`,
  ).slice(0, 280);

  const transfer = await insertWalletPeerTransfer({
    id: `ewtx_payout_${Date.now()}_${randomUUID().slice(0, 8)}`,
    referenceCode: buildWalletPayoutTransferReferenceCode('WD'),
    senderUserId: memberUserId,
    senderUsername: normalizeText(existingRequest?.requestedByUsername),
    senderEmail: normalizeText(existingRequest?.requestedByEmail),
    recipientUserId: SYSTEM_PAYOUT_REQUEST_USER_ID,
    recipientUsername: SYSTEM_PAYOUT_REQUEST_USERNAME,
    recipientEmail: '',
    amount,
    currencyCode: DEFAULT_CURRENCY_CODE,
    note,
    status: 'Completed',
  }, executor);

  if (!transfer) {
    return {
      success: false,
      status: 500,
      error: 'Unable to record E-Wallet payout transfer.',
    };
  }

  const nextBalance = roundCurrencyAmount(currentBalance - amount);
  const updatedWalletAccount = await updateWalletAccountBalanceByUserId(memberUserId, nextBalance, executor);
  if (!updatedWalletAccount) {
    return {
      success: false,
      status: 500,
      error: 'Unable to update E-Wallet balance during payout fulfillment.',
    };
  }

  return {
    success: true,
    status: 200,
  };
}

export async function getPayoutRequests(query = {}) {
  const identityKeys = resolvePayoutRequestIdentityKeys({
    userId: query?.userId,
    username: query?.username,
    email: query?.email,
  });

  if (identityKeys.size === 0) {
    return {
      success: false,
      status: 400,
      error: 'A member identifier is required to load payout requests.',
    };
  }

  const requests = await readMockPayoutRequestsStore();
  const filteredRequests = requests.filter((request) =>
    doesPayoutRequestBelongToIdentity(request, identityKeys)
  );

  return {
    success: true,
    status: 200,
    data: { requests: filteredRequests },
  };
}

export async function createPayoutRequest(payload = {}) {
  const amount = Number(payload.amount);
  const identityKeys = resolvePayoutRequestIdentityKeys(payload);
  const sourceKey = normalizeCommissionPayoutSourceKey(payload.sourceKey);

  if (identityKeys.size === 0) {
    return {
      success: false,
      status: 400,
      error: 'A member identifier is required to create a payout request.',
    };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Payout amount must be greater than 0.',
    };
  }

  const requests = await readMockPayoutRequestsStore();
  const nowIso = new Date().toISOString();

  const nextRequest = sanitizePayoutRequestRecord({
    id: `payout_${Date.now()}`,
    sourceKey,
    sourceLabel: payload.sourceLabel || resolveCommissionPayoutSourceLabel(sourceKey),
    amount,
    status: 'Pending',
    requestedByUserId: payload.userId,
    requestedByUsername: payload.username,
    requestedByEmail: payload.email,
    requestedByName: payload.requestedByName || payload.name,
    createdAt: nowIso,
  });

  if (!nextRequest || nextRequest.amount <= 0) {
    return {
      success: false,
      status: 500,
      error: 'Unable to create payout request payload.',
    };
  }

  requests.unshift(nextRequest);
  await writeMockPayoutRequestsStore(requests);

  return {
    success: true,
    status: 201,
    data: {
      success: true,
      request: nextRequest,
    },
  };
}

export async function getAdminPayoutRequests() {
  const requests = await readMockPayoutRequestsStore();

  return {
    success: true,
    status: 200,
    data: { requests },
  };
}

export async function updateAdminPayoutRequestStatus(payload = {}) {
  const requestId = normalizeText(payload.id);
  if (!requestId) {
    return {
      success: false,
      status: 400,
      error: 'Payout request id is required.',
    };
  }

  const nextStatusKey = normalizeText(payload.status).toLowerCase();
  if (nextStatusKey !== 'pending' && nextStatusKey !== 'fulfilled') {
    return {
      success: false,
      status: 400,
      error: 'Status must be either pending or fulfilled.',
    };
  }

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    const existingRequest = await readPayoutRequestById(requestId, client, { forUpdate: true });
    if (!existingRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 404,
        error: 'Payout request not found.',
      };
    }

    const currentStatusLabel = normalizePayoutRequestStatus(existingRequest?.status);
    const nextStatusLabel = nextStatusKey === 'fulfilled' ? 'Fulfilled' : 'Pending';
    const sourceKey = normalizePayoutRequestSourceKey(existingRequest?.sourceKey);
    const nowIso = new Date().toISOString();
    const updatedBy = normalizeText(payload.updatedBy || 'admin');

    if (currentStatusLabel === nextStatusLabel) {
      await client.query('COMMIT');
      transactionClosed = true;
      return {
        success: true,
        status: 200,
        data: {
          success: true,
          request: existingRequest,
          updatedAt: normalizeText(existingRequest?.updatedAt || existingRequest?.fulfilledAt || existingRequest?.createdAt),
          updatedBy: normalizeText(existingRequest?.fulfilledBy || updatedBy),
          statusChanged: false,
        },
      };
    }

    if (nextStatusLabel === 'Pending') {
      if (sourceKey === EWALLET_PAYOUT_SOURCE_KEY && currentStatusLabel === 'Fulfilled') {
        await client.query('ROLLBACK');
        transactionClosed = true;
        return {
          success: false,
          status: 400,
          error: 'Fulfilled E-Wallet payout requests cannot be reopened to pending.',
        };
      }

      const revertedRequest = sanitizePayoutRequestRecord({
        ...existingRequest,
        status: 'Pending',
        updatedAt: nowIso,
        fulfilledAt: '',
        fulfilledBy: '',
        transferMode: '',
        bankDetails: '',
        transferReference: '',
        generalInfo: '',
      }, requestId);

      const updatedRequest = await updatePayoutRequestById(revertedRequest, client);
      if (!updatedRequest) {
        await client.query('ROLLBACK');
        transactionClosed = true;
        return {
          success: false,
          status: 500,
          error: 'Unable to update payout request status.',
        };
      }

      await client.query('COMMIT');
      transactionClosed = true;

      return {
        success: true,
        status: 200,
        data: {
          success: true,
          request: updatedRequest,
          updatedAt: nowIso,
          updatedBy,
          statusChanged: true,
        },
      };
    }

    const transferMode = normalizeText(payload.transferMode || existingRequest?.transferMode);
    const bankDetails = normalizeText(payload.bankDetails || existingRequest?.bankDetails);
    const transferReference = normalizeText(payload.transferReference || existingRequest?.transferReference);
    const generalInfo = normalizeText(payload.generalInfo || existingRequest?.generalInfo);

    if (!transferMode) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 400,
        error: 'Mode of transfer is required to set fulfilled status.',
      };
    }

    if (!bankDetails) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 400,
        error: 'Bank details are required to set fulfilled status.',
      };
    }

    if (sourceKey === EWALLET_PAYOUT_SOURCE_KEY) {
      const walletSettlement = await settleEWalletPayoutRequest(existingRequest, {
        transferMode,
        bankDetails,
        transferReference,
        generalInfo,
      }, client);
      if (!walletSettlement.success) {
        await client.query('ROLLBACK');
        transactionClosed = true;
        return walletSettlement;
      }
    }

    const fulfilledRequest = sanitizePayoutRequestRecord({
      ...existingRequest,
      status: 'Fulfilled',
      updatedAt: nowIso,
      fulfilledAt: nowIso,
      fulfilledBy: updatedBy,
      transferMode,
      bankDetails,
      transferReference,
      generalInfo,
    }, requestId);

    const updatedRequest = await updatePayoutRequestById(fulfilledRequest, client);
    if (!updatedRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to update payout request status.',
      };
    }

    await client.query('COMMIT');
    transactionClosed = true;

    return {
      success: true,
      status: 200,
      data: {
        success: true,
        request: updatedRequest,
        updatedAt: nowIso,
        updatedBy,
        statusChanged: true,
      },
    };
  } catch (error) {
    if (!transactionClosed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function fulfillAdminPayoutRequest(payload = {}) {
  const requestId = normalizeText(payload.id);
  if (!requestId) {
    return {
      success: false,
      status: 400,
      error: 'Payout request id is required.',
    };
  }

  const transferMode = normalizeText(payload.transferMode);
  const bankDetails = normalizeText(payload.bankDetails);
  const transferReference = normalizeText(payload.transferReference);
  const generalInfo = normalizeText(payload.generalInfo);
  const fulfilledBy = normalizeText(payload.updatedBy || payload.fulfilledBy || 'admin');

  if (!transferMode) {
    return {
      success: false,
      status: 400,
      error: 'Mode of transfer is required for fulfillment.',
    };
  }

  if (!bankDetails) {
    return {
      success: false,
      status: 400,
      error: 'Bank details are required for fulfillment.',
    };
  }

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    const existingRequest = await readPayoutRequestById(requestId, client, { forUpdate: true });
    if (!existingRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 404,
        error: 'Payout request not found.',
      };
    }

    if (normalizePayoutRequestStatus(existingRequest?.status) === 'Fulfilled') {
      await client.query('COMMIT');
      transactionClosed = true;
      return {
        success: true,
        status: 200,
        data: {
          success: true,
          request: existingRequest,
          updatedAt: normalizeText(existingRequest?.updatedAt || existingRequest?.fulfilledAt || existingRequest?.createdAt),
          updatedBy: normalizeText(existingRequest?.fulfilledBy || fulfilledBy),
        },
      };
    }

    const sourceKey = normalizePayoutRequestSourceKey(existingRequest?.sourceKey);
    if (sourceKey === EWALLET_PAYOUT_SOURCE_KEY) {
      const walletSettlement = await settleEWalletPayoutRequest(existingRequest, {
        transferMode,
        bankDetails,
        transferReference,
        generalInfo,
      }, client);
      if (!walletSettlement.success) {
        await client.query('ROLLBACK');
        transactionClosed = true;
        return walletSettlement;
      }
    }

    const nowIso = new Date().toISOString();
    const updatedRequestPayload = sanitizePayoutRequestRecord({
      ...existingRequest,
      status: 'Fulfilled',
      updatedAt: nowIso,
      fulfilledAt: nowIso,
      fulfilledBy,
      transferMode,
      bankDetails,
      transferReference,
      generalInfo,
    }, requestId);

    const updatedRequest = await updatePayoutRequestById(updatedRequestPayload, client);
    if (!updatedRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to update payout request.',
      };
    }

    await client.query('COMMIT');
    transactionClosed = true;

    return {
      success: true,
      status: 200,
      data: {
        success: true,
        request: updatedRequest,
        updatedAt: nowIso,
        updatedBy: fulfilledBy,
      },
    };
  } catch (error) {
    if (!transactionClosed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}
