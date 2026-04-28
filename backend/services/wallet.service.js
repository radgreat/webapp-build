import { randomUUID } from 'crypto';
import pool from '../db/db.js';
import { findUserById, findUserByIdentifier } from '../stores/user.store.js';
import {
  ensureWalletTables,
  upsertWalletAccount,
  lockWalletAccountsByUserIds,
  updateWalletAccountBalanceByUserId,
  insertWalletPeerTransfer,
  listWalletTransfersForUserId,
  readWalletCommissionOffsetMapForUserId,
  resolveWalletCommissionTransferSenderId,
} from '../stores/wallet.store.js';
import { createPayoutRequest } from './payout.service.js';
import {
  buildAccountUpgradeRequiredResult,
  isPendingOrReservationMember,
} from '../utils/member-capability.helpers.js';
import { resolveMemberActivityStateByPersonalBv } from '../utils/member-activity.helpers.js';

const DEFAULT_CURRENCY_CODE = 'USD';
const EWALLET_PAYOUT_SOURCE_KEY = 'ewallet';
const EWALLET_PAYOUT_SOURCE_LABEL = 'E-Wallet';
const COMMISSION_SOURCE_META = Object.freeze({
  fasttrack: { key: 'fasttrack', label: 'Fast Track Bonus' },
  infinitybuilder: { key: 'infinitybuilder', label: 'Infinity Tier Commission' },
  legacyleadership: { key: 'legacyleadership', label: 'Legacy Leadership Bonus' },
  salesteam: { key: 'salesteam', label: 'Sales Team Commissions' },
  retailprofit: { key: 'retailprofit', label: 'Retail Profit' },
});

function normalizeText(value) {
  return String(value || '').trim();
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function normalizeTransferHistoryLimit(value) {
  const parsed = Number.parseInt(String(value ?? '50'), 10);
  if (!Number.isFinite(parsed)) {
    return 50;
  }
  return Math.min(100, Math.max(1, parsed));
}

function sanitizeTransferNote(value) {
  return normalizeText(value).slice(0, 280);
}

function normalizePayoutMethod(valueInput, fallback = 'instant') {
  const normalized = normalizeText(valueInput).toLowerCase();
  if (normalized === 'instant') {
    return 'instant';
  }
  if (normalized === 'standard') {
    return 'standard';
  }
  return fallback === 'standard' ? 'standard' : 'instant';
}

function buildTransferReferenceCode(prefix = 'P2P') {
  const dateSegment = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `${normalizeText(prefix).toUpperCase() || 'P2P'}-${dateSegment}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

function resolveCommissionSourceMeta(sourceKey) {
  const normalizedSourceKey = normalizeText(sourceKey).toLowerCase();
  if (!normalizedSourceKey) {
    return null;
  }
  return COMMISSION_SOURCE_META[normalizedSourceKey] || null;
}

async function resolveMemberUserFromIdentity(identityPayload = {}) {
  const userId = normalizeText(identityPayload?.userId);
  if (userId) {
    const byId = await findUserById(userId);
    if (byId) {
      return byId;
    }
  }

  const username = normalizeText(identityPayload?.username);
  if (username) {
    const byUsername = await findUserByIdentifier(username);
    if (byUsername) {
      return byUsername;
    }
  }

  const email = normalizeText(identityPayload?.email);
  if (email) {
    const byEmail = await findUserByIdentifier(email);
    if (byEmail) {
      return byEmail;
    }
  }

  return null;
}

async function resolveRecipientUser(payload = {}) {
  const recipientUserId = normalizeText(payload?.recipientUserId);
  if (recipientUserId) {
    const byId = await findUserById(recipientUserId);
    if (byId) {
      return byId;
    }
  }

  const recipientUsername = normalizeText(payload?.recipientUsername);
  if (recipientUsername) {
    const byUsername = await findUserByIdentifier(recipientUsername);
    if (byUsername) {
      return byUsername;
    }
  }

  const recipientEmail = normalizeText(payload?.recipientEmail);
  if (recipientEmail) {
    const byEmail = await findUserByIdentifier(recipientEmail);
    if (byEmail) {
      return byEmail;
    }
  }

  const recipientIdentifier = normalizeText(payload?.recipientIdentifier);
  if (recipientIdentifier) {
    return findUserByIdentifier(recipientIdentifier);
  }

  return null;
}

function decorateTransferForViewer(transfer, viewerUserId) {
  const safeTransfer = transfer && typeof transfer === 'object' ? transfer : null;
  if (!safeTransfer) {
    return null;
  }

  const normalizedViewerUserId = normalizeText(viewerUserId);
  const isOutgoing = normalizedViewerUserId
    ? normalizeText(safeTransfer.senderUserId) === normalizedViewerUserId
    : false;
  const direction = isOutgoing ? 'outgoing' : 'incoming';
  const counterpartyUserId = isOutgoing
    ? normalizeText(safeTransfer.recipientUserId)
    : normalizeText(safeTransfer.senderUserId);
  const counterpartyUsername = isOutgoing
    ? normalizeText(safeTransfer.recipientUsername)
    : normalizeText(safeTransfer.senderUsername);
  const counterpartyEmail = isOutgoing
    ? normalizeText(safeTransfer.recipientEmail)
    : normalizeText(safeTransfer.senderEmail);
  const counterpartyLabel = counterpartyUsername || counterpartyEmail || counterpartyUserId || 'Member';

  return {
    ...safeTransfer,
    direction,
    counterpartyUserId,
    counterpartyUsername,
    counterpartyEmail,
    counterpartyLabel,
  };
}

function buildTransferSummary(transfers = []) {
  return (Array.isArray(transfers) ? transfers : []).reduce((summary, transfer) => {
    const amount = roundCurrencyAmount(transfer?.amount);
    if (amount <= 0) {
      return summary;
    }

    if (String(transfer?.direction || '').toLowerCase() === 'outgoing') {
      summary.totalSent = roundCurrencyAmount(summary.totalSent + amount);
    } else {
      summary.totalReceived = roundCurrencyAmount(summary.totalReceived + amount);
    }

    summary.transferCount += 1;
    return summary;
  }, {
    totalSent: 0,
    totalReceived: 0,
    transferCount: 0,
  });
}

async function buildWalletSnapshotForUser(user, options = {}) {
  const safeUser = user && typeof user === 'object' ? user : null;
  if (!safeUser) {
    return {
      wallet: null,
      transfers: [],
      commissionOffsets: {
        fasttrack: 0,
        infinitybuilder: 0,
        legacyleadership: 0,
        salesteam: 0,
        retailprofit: 0,
      },
    };
  }

  const seedBalance = roundCurrencyAmount(options?.seedBalance);
  const transferLimit = normalizeTransferHistoryLimit(options?.limit);

  const account = await upsertWalletAccount({
    userId: normalizeText(safeUser.id),
    username: normalizeText(safeUser.username),
    email: normalizeText(safeUser.email),
    accountName: normalizeText(safeUser.name),
    currencyCode: DEFAULT_CURRENCY_CODE,
    startingBalance: seedBalance,
  });

  const rawTransfers = await listWalletTransfersForUserId(safeUser.id, transferLimit);
  const transfers = rawTransfers
    .map((transfer) => decorateTransferForViewer(transfer, safeUser.id))
    .filter(Boolean);
  const summary = buildTransferSummary(transfers);
  const commissionOffsets = await readWalletCommissionOffsetMapForUserId(safeUser.id);

  return {
    wallet: {
      ...(account || {}),
      totalSent: summary.totalSent,
      totalReceived: summary.totalReceived,
      transferCount: summary.transferCount,
    },
    transfers,
    commissionOffsets,
  };
}

export async function getEWalletOverview(query = {}) {
  await ensureWalletTables();

  const memberUser = await resolveMemberUserFromIdentity(query);
  if (!memberUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for this E-Wallet request.',
    };
  }

  const snapshot = await buildWalletSnapshotForUser(memberUser, {
    seedBalance: query?.seedBalance,
    limit: query?.limit,
  });

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      wallet: snapshot.wallet,
      transfers: snapshot.transfers,
      commissionOffsets: snapshot.commissionOffsets,
    },
  };
}

export async function getEWalletCommissionOffsets(query = {}) {
  await ensureWalletTables();

  const memberUser = await resolveMemberUserFromIdentity(query);
  if (!memberUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for this E-Wallet request.',
    };
  }

  const offsets = await readWalletCommissionOffsetMapForUserId(memberUser.id);
  return {
    success: true,
    status: 200,
    data: {
      success: true,
      userId: memberUser.id,
      offsets,
    },
  };
}

export async function createEWalletPeerTransfer(payload = {}) {
  await ensureWalletTables();

  const senderUser = await resolveMemberUserFromIdentity(payload);
  if (!senderUser) {
    return {
      success: false,
      status: 404,
      error: 'Sending member account was not found.',
    };
  }

  const recipientUser = await resolveRecipientUser(payload);
  if (!recipientUser) {
    return {
      success: false,
      status: 404,
      error: 'Recipient account was not found. Use a valid username or email.',
    };
  }

  if (normalizeText(senderUser?.id) === normalizeText(recipientUser?.id)) {
    return {
      success: false,
      status: 400,
      error: 'Peer transfer requires a different recipient account.',
    };
  }

  const amountRaw = Number(payload?.amount);
  if (!Number.isFinite(amountRaw) || amountRaw <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Transfer amount must be greater than 0.',
    };
  }

  const amount = roundCurrencyAmount(amountRaw);
  if (amount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Transfer amount must be at least $0.01.',
    };
  }

  const note = sanitizeTransferNote(payload?.note);
  const senderSeedBalance = roundCurrencyAmount(payload?.senderSeedBalance);
  const transferId = `ewtx_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const referenceCode = buildTransferReferenceCode('P2P');

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    await upsertWalletAccount({
      userId: senderUser.id,
      username: senderUser.username,
      email: senderUser.email,
      accountName: senderUser.name,
      currencyCode: DEFAULT_CURRENCY_CODE,
      startingBalance: senderSeedBalance,
    }, client);

    await upsertWalletAccount({
      userId: recipientUser.id,
      username: recipientUser.username,
      email: recipientUser.email,
      accountName: recipientUser.name,
      currencyCode: DEFAULT_CURRENCY_CODE,
      startingBalance: 0,
    }, client);

    const lockedAccounts = await lockWalletAccountsByUserIds(
      [senderUser.id, recipientUser.id],
      client,
    );

    const senderAccount = lockedAccounts.find((account) => normalizeText(account?.userId) === normalizeText(senderUser.id));
    const recipientAccount = lockedAccounts.find((account) => normalizeText(account?.userId) === normalizeText(recipientUser.id));

    if (!senderAccount || !recipientAccount) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to lock E-Wallet accounts for transfer.',
      };
    }

    const senderBalance = roundCurrencyAmount(senderAccount?.balance);
    if (senderBalance < amount) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 400,
        error: `Insufficient E-Wallet balance. Available: ${senderBalance.toFixed(2)} USD.`,
      };
    }

    const recipientBalance = roundCurrencyAmount(recipientAccount?.balance);
    const nextSenderBalance = roundCurrencyAmount(senderBalance - amount);
    const nextRecipientBalance = roundCurrencyAmount(recipientBalance + amount);

    const updatedSenderAccount = await updateWalletAccountBalanceByUserId(senderUser.id, nextSenderBalance, client);
    await updateWalletAccountBalanceByUserId(recipientUser.id, nextRecipientBalance, client);

    const transfer = await insertWalletPeerTransfer({
      id: transferId,
      referenceCode,
      senderUserId: senderUser.id,
      senderUsername: senderUser.username,
      senderEmail: senderUser.email,
      recipientUserId: recipientUser.id,
      recipientUsername: recipientUser.username,
      recipientEmail: recipientUser.email,
      amount,
      currencyCode: DEFAULT_CURRENCY_CODE,
      note,
      status: 'Completed',
    }, client);

    if (!transfer || !updatedSenderAccount) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to save E-Wallet transfer.',
      };
    }

    await client.query('COMMIT');
    transactionClosed = true;

    const snapshot = await buildWalletSnapshotForUser(senderUser, {
      limit: payload?.limit,
    });

    return {
      success: true,
      status: 201,
      data: {
        success: true,
        transfer: decorateTransferForViewer(transfer, senderUser.id),
        wallet: snapshot.wallet,
        transfers: snapshot.transfers,
        commissionOffsets: snapshot.commissionOffsets,
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

export async function createEWalletCommissionTransfer(payload = {}) {
  await ensureWalletTables();

  const sourceMeta = resolveCommissionSourceMeta(payload?.sourceKey);
  if (!sourceMeta) {
    return {
      success: false,
      status: 400,
      error: 'Invalid commission source key for E-Wallet transfer.',
    };
  }

  const memberUser = await resolveMemberUserFromIdentity(payload);
  if (!memberUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for commission transfer.',
    };
  }
  if (isPendingOrReservationMember(memberUser)) {
    return buildAccountUpgradeRequiredResult();
  }
  if (sourceMeta.key === 'salesteam') {
    const activityState = resolveMemberActivityStateByPersonalBv(memberUser);
    if (!activityState?.isActive) {
      return {
        success: false,
        status: 403,
        error: 'Account must be Active to transfer Sales Team commissions.',
      };
    }
  }

  const amountRaw = Number(payload?.amount);
  if (!Number.isFinite(amountRaw) || amountRaw <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Transfer amount must be greater than 0.',
    };
  }

  const amount = roundCurrencyAmount(amountRaw);
  if (amount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Transfer amount must be at least $0.01.',
    };
  }

  const senderSeedBalance = roundCurrencyAmount(payload?.senderSeedBalance);
  const transferId = `ewtx_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const referenceCode = buildTransferReferenceCode('C2W');
  const note = sanitizeTransferNote(payload?.note || `Transferred from ${sourceMeta.label}`);
  const senderSystemId = resolveWalletCommissionTransferSenderId(sourceMeta.key);
  if (!senderSystemId) {
    return {
      success: false,
      status: 400,
      error: 'Unsupported commission transfer source.',
    };
  }

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    await upsertWalletAccount({
      userId: memberUser.id,
      username: memberUser.username,
      email: memberUser.email,
      accountName: memberUser.name,
      currencyCode: DEFAULT_CURRENCY_CODE,
      startingBalance: senderSeedBalance,
    }, client);

    const lockedAccounts = await lockWalletAccountsByUserIds([memberUser.id], client);
    const memberWalletAccount = lockedAccounts.find((account) => normalizeText(account?.userId) === normalizeText(memberUser.id));
    if (!memberWalletAccount) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to lock your E-Wallet account for transfer.',
      };
    }

    const nextBalance = roundCurrencyAmount(roundCurrencyAmount(memberWalletAccount.balance) + amount);
    const updatedWalletAccount = await updateWalletAccountBalanceByUserId(memberUser.id, nextBalance, client);

    const transfer = await insertWalletPeerTransfer({
      id: transferId,
      referenceCode,
      senderUserId: senderSystemId,
      senderUsername: sourceMeta.label,
      senderEmail: '',
      recipientUserId: memberUser.id,
      recipientUsername: memberUser.username,
      recipientEmail: memberUser.email,
      amount,
      currencyCode: DEFAULT_CURRENCY_CODE,
      note,
      status: 'Completed',
    }, client);

    if (!transfer || !updatedWalletAccount) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to transfer commission to E-Wallet.',
      };
    }

    await client.query('COMMIT');
    transactionClosed = true;

    const snapshot = await buildWalletSnapshotForUser(memberUser, {
      limit: payload?.limit,
    });

    return {
      success: true,
      status: 201,
      data: {
        success: true,
        sourceKey: sourceMeta.key,
        transfer: decorateTransferForViewer(transfer, memberUser.id),
        wallet: snapshot.wallet,
        transfers: snapshot.transfers,
        commissionOffsets: snapshot.commissionOffsets,
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

export async function createEWalletPayoutRequest(payload = {}) {
  await ensureWalletTables();

  const memberUser = await resolveMemberUserFromIdentity(payload);
  if (!memberUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for E-Wallet payout request.',
    };
  }
  if (isPendingOrReservationMember(memberUser)) {
    return buildAccountUpgradeRequiredResult();
  }

  const amount = roundCurrencyAmount(payload?.amount);
  const note = sanitizeTransferNote(payload?.note || `E-Wallet payout request for ${amount.toFixed(2)} ${DEFAULT_CURRENCY_CODE}`);
  const payoutMethod = normalizePayoutMethod(payload?.payoutMethod);
  const payoutResult = await createPayoutRequest({
    userId: memberUser.id,
    username: memberUser.username,
    email: memberUser.email,
    requestedByName: payload?.requestedByName || memberUser.name || memberUser.username,
    sourceKey: EWALLET_PAYOUT_SOURCE_KEY,
    sourceLabel: EWALLET_PAYOUT_SOURCE_LABEL,
    amount,
    note,
    payoutMethod,
    senderSeedBalance: roundCurrencyAmount(payload?.senderSeedBalance),
  });
  if (!payoutResult.success) {
    return payoutResult;
  }

  const snapshot = await buildWalletSnapshotForUser(memberUser, {
    limit: payload?.limit,
  });

  return {
    success: true,
    status: payoutResult.status || 201,
    data: {
      success: true,
      request: payoutResult?.data?.request || null,
      payoutMethod,
      wallet: snapshot.wallet,
      transfers: snapshot.transfers,
      commissionOffsets: snapshot.commissionOffsets,
    },
  };
}
