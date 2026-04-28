import { promises as dns } from 'dns';

// Common disposable / temporary email providers. Not exhaustive but catches
// the obvious throwaways used to bypass signup limits.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'sharklasers.com', '10minutemail.com', '10minutemail.net', 'tempmail.com',
  'temp-mail.org', 'temp-mail.io', 'throwawaymail.com', 'yopmail.com',
  'trashmail.com', 'trashmail.net', 'getnada.com', 'maildrop.cc', 'dispostable.com',
  'fakeinbox.com', 'mintemail.com', 'mohmal.com', 'mytemp.email', 'emailondeck.com',
  'tempail.com', 'tmpmail.org', 'tmpmail.net', 'mailnesia.com', 'mailcatch.com',
  'spambox.us', 'spam4.me', 'inboxbear.com', 'fake-mail.net', 'mvrht.com',
  'discard.email', 'discardmail.com', 'mailsac.com', 'mailtemp.info',
  'mailinator.net', 'mailinator.org', 'tempinbox.com', 'tempmailaddress.com',
  'tempmailo.com', 'tempr.email', 'tempemail.com', 'tempemail.net',
  'mailpoof.com', 'mail-temp.com', 'minuteinbox.com', 'mvrht.net',
  'getairmail.com', 'easytrashmail.com', 'mohmal.in', 'wegwerfmail.de',
]);

const dnsCache = new Map(); // domain -> { ok, expires }
const CACHE_TTL_MS = 30 * 60 * 1000;

async function domainHasMail(domain) {
  const cached = dnsCache.get(domain);
  if (cached && cached.expires > Date.now()) return cached.ok;

  let ok = false;
  try {
    const records = await dns.resolveMx(domain);
    ok = Array.isArray(records) && records.length > 0;
  } catch {
    // No MX — some domains accept mail at the A record. Try that as a fallback.
    try {
      const a = await dns.resolve4(domain);
      ok = Array.isArray(a) && a.length > 0;
    } catch {
      ok = false;
    }
  }

  dnsCache.set(domain, { ok, expires: Date.now() + CACHE_TTL_MS });
  return ok;
}

export async function validateGenuineEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    return { ok: false, reason: 'Please enter a valid email address' };
  }
  const domain = email.split('@')[1].toLowerCase().trim();
  if (!domain || domain.includes('..') || !domain.includes('.')) {
    return { ok: false, reason: 'Please enter a valid email address' };
  }
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: 'Disposable email addresses are not allowed. Please use a real email.' };
  }
  const reachable = await domainHasMail(domain);
  if (!reachable) {
    return { ok: false, reason: `The email domain "${domain}" does not appear to accept mail. Please use a real email.` };
  }
  return { ok: true };
}
