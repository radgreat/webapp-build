import {
  getRegisteredMembers,
  createRegisteredMember,
  createRegisteredMemberPaymentIntent,
  completeRegisteredMemberPaymentIntent,
  updateRegisteredMemberPlacement,
  getMemberRanks,
  recordMemberPurchase,
  upgradeMemberAccount,
} from '../services/member.service.js';

export async function listRegisteredMembers(req, res) {
  try {
    const result = await getRegisteredMembers();
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load registered members.',
    });
  }
}

export async function registerMember(req, res) {
  try {
    const requestPath = String(req.path || '').toLowerCase();
    const isAdminEnrollmentRequest = requestPath.startsWith('/admin/');
    const result = await createRegisteredMember({
      ...(req.body || {}),
      isAdminPlacement: isAdminEnrollmentRequest,
      enrollmentContext: isAdminEnrollmentRequest ? 'admin' : 'member',
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json({
      member: result.member,
    });
  } catch (error) {
    console.error('registerMember failed:', error?.stack || error?.message || error);
    return res.status(500).json({
      error: 'Unable to register member.',
    });
  }
}

export async function postRegisteredMemberPaymentIntent(req, res) {
  try {
    const requestPath = String(req.path || '').toLowerCase();
    const isAdminEnrollmentRequest = requestPath.startsWith('/admin/');
    const result = await createRegisteredMemberPaymentIntent({
      ...(req.body || {}),
      isAdminPlacement: isAdminEnrollmentRequest,
      enrollmentContext: isAdminEnrollmentRequest ? 'admin' : 'member',
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('postRegisteredMemberPaymentIntent failed:', error?.stack || error?.message || error);
    return res.status(500).json({
      error: 'Unable to create enrollment payment intent.',
    });
  }
}

export async function postCompleteRegisteredMemberPaymentIntent(req, res) {
  try {
    const requestPath = String(req.path || '').toLowerCase();
    const isAdminEnrollmentRequest = requestPath.startsWith('/admin/');
    const result = await completeRegisteredMemberPaymentIntent({
      ...(req.body || {}),
      isAdminPlacement: isAdminEnrollmentRequest,
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('postCompleteRegisteredMemberPaymentIntent failed:', error?.stack || error?.message || error);
    return res.status(500).json({
      error: 'Unable to finalize enrollment payment intent.',
    });
  }
}

export async function patchRegisteredMemberPlacement(req, res) {
  try {
    const requestPath = String(req.path || '').toLowerCase();
    const isAdminPlacementRequest = requestPath.startsWith('/admin/');
    const result = await updateRegisteredMemberPlacement({
      ...(req.body || {}),
      memberId: req.params?.memberId,
      isAdminPlacement: isAdminPlacementRequest,
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json({
      success: true,
      member: result.member,
    });
  } catch (error) {
    console.error('patchRegisteredMemberPlacement failed:', error?.stack || error?.message || error);
    return res.status(500).json({
      error: 'Unable to update member placement.',
    });
  }
}

export async function listMemberRanks(req, res) {
  try {
    const result = await getMemberRanks();
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load member ranks.',
    });
  }
}

export async function postRecordMemberPurchase(req, res) {
  try {
    const result = await recordMemberPurchase(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json({
      success: true,
      user: result.user,
      purchase: result.purchase,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to record member purchase activity.',
    });
  }
}

export async function postUpgradeMemberAccount(req, res) {
  try {
    const result = await upgradeMemberAccount(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json({
      success: true,
      user: result.user,
      member: result.member,
      upgrade: result.upgrade,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to process account upgrade.',
    });
  }
}
