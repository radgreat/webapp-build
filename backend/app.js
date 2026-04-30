import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import adminAuthRoutes from './routes/admin-auth.routes.js';
import memberRoutes from './routes/member.routes.js';
import metricsRoutes from './routes/metrics.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import payoutRoutes from './routes/payout.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import runtimeRoutes from './routes/runtime.routes.js';
import cutoffRoutes from './routes/cutoff.routes.js';
import adminRoutes from './routes/admin.routes.js';
import emailRoutes from './routes/email.routes.js';
import commissionContainerRoutes from './routes/commission-container.routes.js';
import storeProductRoutes from './routes/store-product.routes.js';
import storeCheckoutRoutes from './routes/store-checkout.routes.js';
import memberAchievementRoutes from './routes/member-achievement.routes.js';
import memberGoodLifeRoutes from './routes/member-good-life.routes.js';
import memberNotificationRoutes from './routes/member-notification.routes.js';
import memberBusinessCenterRoutes from './routes/member-business-center.routes.js';
import preferredAttributionRoutes from './routes/preferred-attribution.routes.js';
import stripeWebhookRoutes from './routes/stripe-webhook.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import autoShipRoutes from './routes/auto-ship.routes.js';
import { warmRegisteredMembersStoreSchema } from './stores/member.store.js';
import { ensureMemberUserLookupIndexes } from './stores/user.store.js';
import { warmPreferredAttributionStoreSchema } from './stores/preferred-attribution.store.js';
import {
  resolvePayoutAutoRetryEnabled,
  resolvePayoutAutoRetryIntervalMs,
  retryEligibleFailedStripePayoutRequests,
} from './services/payout.service.js';

const app = express();
const PORT = Number.parseInt(process.env.PORT || '3000', 10);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
let payoutAutoRetryIntervalHandle = null;


app.use('/api', stripeWebhookRoutes);
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(preferredAttributionRoutes);

app.use('/api/member-auth', authRoutes);
app.use('/api/member-auth', memberAchievementRoutes);
app.use('/api/member-auth', memberGoodLifeRoutes);
app.use('/api/member-auth', memberNotificationRoutes);
app.use('/api/member-auth', memberBusinessCenterRoutes);
app.use('/api/member-auth', autoShipRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api', memberRoutes);
app.use('/api', metricsRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', payoutRoutes);
app.use('/api', walletRoutes);
app.use('/api', runtimeRoutes);
app.use('/api', cutoffRoutes);
app.use('/api', adminRoutes);
app.use('/api', emailRoutes);
app.use('/api', commissionContainerRoutes);
app.use('/api', storeProductRoutes);
app.use('/api', storeCheckoutRoutes);
app.use('/api', ledgerRoutes);

// temporary health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'Express server is running' });
});

app.get(['/store', '/store/', '/store.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'store.html'));
});

app.get(['/store/product', '/store/product/', '/store-product.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'store-product.html'));
});

app.get(['/store/checkout', '/store/checkout/', '/store-checkout.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'store-checkout.html'));
});

app.get(['/store/support', '/store/support/', '/store-support.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'store-support.html'));
});

app.get(['/store/login', '/store/login/', '/store-login.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'store-login.html'));
});

app.get(['/store/register', '/store/register/', '/store-register.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'store-register.html'));
});

app.get(['/store/dashboard', '/store/dashboard/', '/store-dashboard.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'store-dashboard.html'));
});

app.get(['/store/password-setup', '/store/password-setup/', '/store-password-setup.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'store-password-setup.html'));
});

app.get(['/binary-tree-next', '/binary-tree-next/', '/binary-tree-next.html'], (req, res) => {
  return res.sendFile(path.join(projectRoot, 'binary-tree-next.html'));
});

// serve existing frontend files from project root for now
app.use(express.static(projectRoot));

// fallback for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found.' });
  }

  const normalizedPath = String(req.path || '').toLowerCase();

  // Keep admin SPA routes anchored to admin.html so reloads on /admin/* do not
  // fall through to index.html and enter redirect/reload loops.
  if (
    normalizedPath === '/admin'
    || normalizedPath === '/admin/'
    || normalizedPath === '/admin.html'
    || normalizedPath.startsWith('/admin/')
  ) {
    return res.sendFile(path.join(projectRoot, 'admin.html'));
  }

  return res.sendFile(path.join(projectRoot, 'index.html'));
});

async function warmStartupStores() {
  const warmups = [
    {
      label: 'registered_members schema',
      run: warmRegisteredMembersStoreSchema,
    },
    {
      label: 'preferred attribution schema',
      run: warmPreferredAttributionStoreSchema,
    },
    {
      label: 'member_users lookup indexes',
      run: ensureMemberUserLookupIndexes,
    },
  ];

  const results = await Promise.allSettled(warmups.map((entry) => entry.run()));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const message = result.reason instanceof Error
        ? result.reason.message
        : String(result.reason || 'Unknown startup warm-up failure.');
      console.warn(`[startup warmup] ${warmups[index].label}: ${message}`);
    }
  });
}

function startPayoutAutoRetryWorker() {
  if (payoutAutoRetryIntervalHandle) {
    return;
  }

  if (!resolvePayoutAutoRetryEnabled()) {
    console.log('[payout-auto-retry] disabled (PAYOUT_AUTO_RETRY_ENABLED=false).');
    return;
  }

  const intervalMs = resolvePayoutAutoRetryIntervalMs();
  const runRetrySweep = async (trigger = 'interval') => {
    try {
      const summary = await retryEligibleFailedStripePayoutRequests({
        trigger,
      });
      const processedCount = Number(summary?.data?.processedCount || 0);
      const paidCount = Number(summary?.data?.paidCount || 0);
      const failedCount = Number(summary?.data?.failedCount || 0);
      if (processedCount > 0 || failedCount > 0) {
        console.log(
          `[payout-auto-retry] trigger=${trigger} processed=${processedCount} paid=${paidCount} failed=${failedCount}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || 'Unknown retry error.');
      console.warn(`[payout-auto-retry] trigger=${trigger} failed: ${message}`);
    }
  };

  const startupDelayMs = Math.min(5_000, Math.max(750, Math.round(intervalMs / 2)));
  const startupTimeout = setTimeout(() => {
    void runRetrySweep('startup');
  }, startupDelayMs);
  if (typeof startupTimeout?.unref === 'function') {
    startupTimeout.unref();
  }

  payoutAutoRetryIntervalHandle = setInterval(() => {
    void runRetrySweep('interval');
  }, intervalMs);
  if (typeof payoutAutoRetryIntervalHandle?.unref === 'function') {
    payoutAutoRetryIntervalHandle.unref();
  }

  console.log(`[payout-auto-retry] worker started; interval=${intervalMs}ms`);
}

async function startServer() {
  await warmStartupStores();
  startPayoutAutoRetryWorker();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running at http://localhost:${PORT}`);
  });
}

void startServer();
