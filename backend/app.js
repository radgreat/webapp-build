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

const app = express();
const PORT = Number.parseInt(process.env.PORT || '3000', 10);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');


app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/member-auth', authRoutes);
app.use('/api/member-auth', memberAchievementRoutes);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
