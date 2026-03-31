import { readMockStoreInvoicesStore } from '../stores/invoice.store.js';
import { readMockUsersStore } from '../stores/user.store.js';
import { readRegisteredMembersStore } from '../stores/member.store.js';
import { createRegisteredMember } from '../services/member.service.js';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeStoreCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

function doesInvoiceMatchPreferredMember(invoice, member) {
  const memberKeys = [
    normalize(member?.userId),
    normalize(member?.id),
    normalize(member?.memberUsername),
    normalize(member?.email),
  ].filter(Boolean);

  if (memberKeys.length === 0) {
    return false;
  }

  const invoiceKeys = [
    normalize(invoice?.buyerUserId),
    normalize(invoice?.buyerUsername),
    normalize(invoice?.buyerEmail),
  ].filter(Boolean);

  return invoiceKeys.some((key) => memberKeys.includes(key));
}

function resolveSponsorByAttribution(users, attributionKey) {
  const targetCode = normalizeStoreCode(attributionKey);
  if (!targetCode) {
    return null;
  }

  return (Array.isArray(users) ? users : []).find((user) => {
    const candidateCodes = [
      normalizeStoreCode(user?.storeCode),
      normalizeStoreCode(user?.publicStoreCode),
      normalizeStoreCode(user?.attributionStoreCode),
    ];
    return candidateCodes.includes(targetCode);
  }) || null;
}

async function run() {
  const [invoices, users, members] = await Promise.all([
    readMockStoreInvoicesStore(),
    readMockUsersStore(),
    readRegisteredMembersStore(),
  ]);

  const preferredMembers = members.filter((member) => normalize(member?.enrollmentPackage) === 'preferred-customer-pack');
  const created = [];
  const skipped = [];
  const failed = [];

  for (const invoice of invoices) {
    const buyerEmail = normalize(invoice?.buyerEmail);
    const attributionKey = normalizeStoreCode(invoice?.attributionKey);

    if (!buyerEmail || !attributionKey) {
      skipped.push({
        invoiceId: invoice?.id || '',
        reason: 'missing-buyer-email-or-attribution',
      });
      continue;
    }

    const alreadyMatched = preferredMembers.some((member) => doesInvoiceMatchPreferredMember(invoice, member));
    if (alreadyMatched) {
      skipped.push({
        invoiceId: invoice?.id || '',
        reason: 'already-matched',
      });
      continue;
    }

    const existingUser = users.find((user) => normalize(user?.email) === buyerEmail);
    if (existingUser) {
      skipped.push({
        invoiceId: invoice?.id || '',
        reason: 'existing-user-email',
      });
      continue;
    }

    const sponsor = resolveSponsorByAttribution(users, attributionKey);
    if (!sponsor?.username) {
      failed.push({
        invoiceId: invoice?.id || '',
        error: 'Unable to resolve sponsor from invoice attribution key.',
      });
      continue;
    }

    const result = await createRegisteredMember({
      fullName: String(invoice?.buyer || 'Store Customer').trim() || 'Store Customer',
      email: buyerEmail,
      memberUsername: buyerEmail.split('@')[0] || '',
      phone: '',
      notes: `Backfilled from invoice ${invoice?.id || ''} (${attributionKey}).`,
      countryFlag: 'us',
      placementLeg: 'left',
      spilloverPlacementSide: 'left',
      spilloverParentMode: 'auto',
      spilloverParentReference: '',
      enrollmentPackage: 'preferred-customer-pack',
      fastTrackTier: 'personal-pack',
      sponsorUsername: String(sponsor.username || '').trim(),
      sponsorName: String(sponsor.name || sponsor.username || 'Store Owner').trim() || 'Store Owner',
    });

    if (!result?.success) {
      failed.push({
        invoiceId: invoice?.id || '',
        error: result?.error || 'Unable to create preferred customer account.',
      });
      continue;
    }

    created.push({
      invoiceId: invoice?.id || '',
      memberId: result?.member?.id || '',
      userId: result?.member?.userId || '',
      email: buyerEmail,
    });
  }

  const summary = {
    invoices: invoices.length,
    preferredMembers: preferredMembers.length,
    createdCount: created.length,
    skippedCount: skipped.length,
    failedCount: failed.length,
    created,
    skipped,
    failed,
  };

  console.log(JSON.stringify(summary, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
