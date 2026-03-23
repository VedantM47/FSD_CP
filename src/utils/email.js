import nodemailer from 'nodemailer';
import log from './logger.js';

/* ==================== CONFIGURATION ==================== */
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_CONFIGURED = !!(EMAIL_USER && EMAIL_PASS);

if (!EMAIL_CONFIGURED) {
  log.warn('EMAIL_SERVICE', '⚠️  EMAIL_USER / EMAIL_PASS not set in .env. Emails will be QUEUED but NOT delivered until credentials are configured.');
}

// Build the transporter only when credentials exist
const transporter = EMAIL_CONFIGURED
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    })
  : null;

/* ==================== BACKGROUND JOB QUEUE ==================== */
// A simple in-memory queue with a configurable batch size & interval.
// For production you'd swap this for Bull/BullMQ + Redis, but this
// works perfectly for a single-server deployment.

const emailQueue = [];          // items: { to, subject, html, resolve, reject }
let isProcessing = false;

const BATCH_SIZE  = 10;          // process up to 10 emails per tick
const TICK_MS     = 3_000;       // process queue every 3 seconds

async function processQueue() {
  if (isProcessing || emailQueue.length === 0) return;
  if (!EMAIL_CONFIGURED) {
    log.warn('EMAIL_QUEUE', `Queue has ${emailQueue.length} jobs, but SMTP credentials are missing. Skipping.`);
    return;
  }

  isProcessing = true;
  const batch = emailQueue.splice(0, BATCH_SIZE);

  log.info('EMAIL_QUEUE', `Processing batch of ${batch.length} emails (${emailQueue.length} remaining)`);

  for (const job of batch) {
    try {
      const info = await transporter.sendMail({
        from: `"Hackathon Platform" <${EMAIL_USER}>`,
        to:      job.to,
        subject: job.subject,
        html:    job.html,
      });
      log.success('EMAIL_QUEUE', `✅ Sent to ${job.to} — messageId: ${info.messageId}`);
      job.resolve(info);
    } catch (err) {
      log.error('EMAIL_QUEUE', `❌ Failed to send to ${job.to}: ${err.message}`);
      job.reject(err);
    }
  }

  isProcessing = false;
}

// Start the background ticker
setInterval(processQueue, TICK_MS);

/* ==================== PUBLIC API ==================== */

/**
 * Enqueue an email for background delivery.
 * Returns a Promise that resolves when the email is actually sent.
 * If SMTP is not configured the promise resolves immediately with status: 'queued_no_smtp'.
 */
export const sendEmail = (options) => {
  if (!EMAIL_CONFIGURED) {
    log.warn('EMAIL_SERVICE', `Email to ${options.to} queued, but SMTP not configured. Add EMAIL_USER and EMAIL_PASS to .env.`);
    return Promise.resolve({ status: 'queued_no_smtp' });
  }

  return new Promise((resolve, reject) => {
    emailQueue.push({ ...options, resolve, reject });
    log.info('EMAIL_QUEUE', `Email to ${options.to} queued. Queue length: ${emailQueue.length}`);
  });
};

/**
 * Return a snapshot of the current queue for admin visibility.
 */
export const getQueueStatus = () => ({
  queued: emailQueue.length,
  isProcessing,
  smtpConfigured: EMAIL_CONFIGURED,
});
