import {
  createAdminLedgerAdjustment,
  getAdminLedgerEntries,
  getAdminLedgerSummary,
  getUserLedgerEntries,
  getUserLedgerSummary,
  reverseLedgerEntry,
} from '../services/ledger.service.js';

export async function listMemberLedgerEntries(req, res) {
  try {
    const result = await getUserLedgerEntries(
      req.query || {},
      req.authenticatedMember || {},
    );

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load member ledger entries.',
    });
  }
}

export async function getMemberLedgerSummary(req, res) {
  try {
    const result = await getUserLedgerSummary(
      req.query || {},
      req.authenticatedMember || {},
    );

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load member ledger summary.',
    });
  }
}

export async function listAdminLedgerEntries(req, res) {
  try {
    const result = await getAdminLedgerEntries(req.query || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load admin ledger entries.',
    });
  }
}

export async function getAdminLedgerSummaryView(req, res) {
  try {
    const result = await getAdminLedgerSummary(req.query || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load admin ledger summary.',
    });
  }
}

export async function postAdminLedgerAdjustment(req, res) {
  try {
    const result = await createAdminLedgerAdjustment(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to create admin ledger adjustment.',
    });
  }
}

export async function postAdminLedgerReverse(req, res) {
  try {
    const result = await reverseLedgerEntry({
      ...(req.body || {}),
      entryId: req.params?.entryId || req.body?.entryId,
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to reverse ledger entry.',
    });
  }
}
