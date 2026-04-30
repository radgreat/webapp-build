import { randomUUID } from 'crypto';

export const LEDGER_ENTRY_TYPES = Object.freeze({
  RETAIL_COMMISSION: 'retail_commission',
  FAST_TRACK_COMMISSION: 'fast_track_commission',
  SALES_TEAM_COMMISSION: 'sales_team_commission',
  LEADERSHIP_MATCHING_BONUS: 'leadership_matching_bonus',
  MATCHING_BONUS_TRANSFER_TO_WALLET: 'matching_bonus_transfer_to_wallet',
  PAYOUT: 'payout',
  ADJUSTMENT: 'adjustment',
  REVERSAL: 'reversal',
});

export const LEDGER_ENTRY_DIRECTIONS = Object.freeze({
  CREDIT: 'credit',
  DEBIT: 'debit',
});

export const LEDGER_ENTRY_STATUSES = Object.freeze({
  PENDING: 'pending',
  POSTED: 'posted',
  PAID: 'paid',
  REVERSED: 'reversed',
  FAILED: 'failed',
});

export const LEDGER_SOURCE_TYPES = Object.freeze({
  ORDER: 'order',
  ENROLLMENT: 'enrollment',
  BINARY_CYCLE: 'binary_cycle',
  SALES_TEAM_COMMISSION: 'sales_team_commission',
  COMMISSION_TRANSFER: 'commission_transfer',
  PAYOUT: 'payout',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
});

const LEDGER_ENTRY_TYPE_SET = new Set(Object.values(LEDGER_ENTRY_TYPES));
const LEDGER_ENTRY_DIRECTION_SET = new Set(Object.values(LEDGER_ENTRY_DIRECTIONS));
const LEDGER_ENTRY_STATUS_SET = new Set(Object.values(LEDGER_ENTRY_STATUSES));
const LEDGER_SOURCE_TYPE_SET = new Set(Object.values(LEDGER_SOURCE_TYPES));

export function normalizeText(value) {
  return String(value || '').trim();
}

export function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

export function roundCurrencyAmount(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.round((Math.max(0, Number(fallback) || 0) + Number.EPSILON) * 100) / 100;
  }
  return Math.round((Math.max(0, numeric) + Number.EPSILON) * 100) / 100;
}

export function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numeric));
}

export function toIsoStringOrEmpty(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

export function normalizeLedgerEntryType(value, fallback = LEDGER_ENTRY_TYPES.ADJUSTMENT) {
  const normalized = normalizeCredential(value);
  if (LEDGER_ENTRY_TYPE_SET.has(normalized)) {
    return normalized;
  }
  const fallbackNormalized = normalizeCredential(fallback);
  if (fallbackNormalized) {
    return fallbackNormalized;
  }
  return fallback === '' ? '' : LEDGER_ENTRY_TYPES.ADJUSTMENT;
}

export function normalizeLedgerDirection(value, fallback = LEDGER_ENTRY_DIRECTIONS.CREDIT) {
  const normalized = normalizeCredential(value);
  if (LEDGER_ENTRY_DIRECTION_SET.has(normalized)) {
    return normalized;
  }
  const fallbackNormalized = normalizeCredential(fallback);
  if (fallbackNormalized) {
    return fallbackNormalized;
  }
  return fallback === '' ? '' : LEDGER_ENTRY_DIRECTIONS.CREDIT;
}

export function normalizeLedgerStatus(value, fallback = LEDGER_ENTRY_STATUSES.POSTED) {
  const normalized = normalizeCredential(value);
  if (LEDGER_ENTRY_STATUS_SET.has(normalized)) {
    return normalized;
  }
  const fallbackNormalized = normalizeCredential(fallback);
  if (fallbackNormalized) {
    return fallbackNormalized;
  }
  return fallback === '' ? '' : LEDGER_ENTRY_STATUSES.POSTED;
}

export function normalizeLedgerSourceType(value, fallback = LEDGER_SOURCE_TYPES.ADMIN_ADJUSTMENT) {
  const normalized = normalizeCredential(value);
  if (LEDGER_SOURCE_TYPE_SET.has(normalized)) {
    return normalized;
  }
  const fallbackNormalized = normalizeCredential(fallback);
  if (fallbackNormalized) {
    return fallbackNormalized;
  }
  return fallback === '' ? '' : LEDGER_SOURCE_TYPES.ADMIN_ADJUSTMENT;
}

export function createLedgerRecordId(prefix = 'led') {
  return `${normalizeText(prefix) || 'led'}_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

export function normalizeLedgerIdempotencyKey(value, maxLength = 180) {
  const normalized = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized.slice(0, Math.max(32, Number(maxLength) || 180));
}

export function toUpperEnum(value) {
  return normalizeCredential(value).toUpperCase();
}

export function isLedgerCreditDirection(direction) {
  return normalizeLedgerDirection(direction) === LEDGER_ENTRY_DIRECTIONS.CREDIT;
}

export function isLedgerDebitDirection(direction) {
  return normalizeLedgerDirection(direction) === LEDGER_ENTRY_DIRECTIONS.DEBIT;
}
