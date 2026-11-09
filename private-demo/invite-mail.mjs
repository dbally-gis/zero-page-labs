import { inviteEmailSubject, validMailId } from './mail-events.mjs';

export const inviteCardFormat = 'card-v1';

function inviteCard(url, expires) {
  const href = url.replace(/[&"<>' ]/g, character => ({
    '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;', "'": '&#39;', ' ': '%20',
  })[character]);
  const expiration = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC',
  }).format(new Date(expires * 1000)) + ' UTC';

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Your COME AT ME! playtest invite</title></head>
<body style="margin:0;background-color:#f4f1e9;color:#182230;font-family:Verdana,Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f4f1e9">
  <tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:540px">
      <tr><td bgcolor="#182230" style="background-color:#182230;border-top:8px solid #b53825;padding:28px 24px 24px;color:#fbf1d8">
        <p style="margin:0 0 12px;color:#ffca54;font-family:'Courier New',monospace;font-size:13px;font-weight:bold;letter-spacing:1px">ZERO PAGE LABS / PRIVATE PLAYTEST</p>
        <h1 style="margin:0;color:#fbf1d8;font-family:'Arial Black',Arial,sans-serif;font-size:52px;line-height:.95;letter-spacing:-2px;font-weight:900">COME AT<br>ME!</h1>
      </td></tr>
      <tr><td bgcolor="#fbf1d8" style="background-color:#fbf1d8;padding:24px;color:#182230">
        <p style="margin:0 0 18px;font-size:16px;line-height:1.55">You're invited to play the browser demo. Put eight cards in order, call “Come At Me,” and survive one last shot from each opponent.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr><td align="center" bgcolor="#ffca54" style="background-color:#ffca54;border:1px solid #182230">
            <a href="${href}" style="display:block;padding:15px 18px;color:#182230;font-size:18px;font-weight:bold;text-decoration:none;mso-padding-alt:0"><!--[if mso]><i style="mso-font-width:150%;mso-text-raise:24pt" hidden>&emsp;</i><![endif]--><span style="mso-text-raise:12pt">Play the demo</span><!--[if mso]><i style="mso-font-width:150%" hidden>&emsp;&#8203;</i><![endif]--></a>
          </td></tr>
        </table>
        <p style="margin:16px 0 0;padding:12px 14px;border-left:4px solid #b53825;background-color:#fff8e8;font-size:15px;line-height:1.5">
          <strong style="display:block;color:#812d20;font-family:'Courier New',monospace;font-size:13px;letter-spacing:1px">INVITE EXPIRES</strong>
          <strong>${expiration}</strong>
        </p>
        <p style="margin:20px 0 0;font-size:13px;line-height:1.5">Daniel<br>Zero Page Labs</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

const retryWindowMs = 23 * 60 * 60 * 1000;

export function deliveryStatus(row, configured, now = Date.now()) {
  if (!row.delivery) return null;
  if (row.delivery.outcome?.status === 'delivered') return 'Delivered';
  if (row.delivery.outcome?.status === 'bounced') return 'Bounced';
  if (row.delivery.accepted) return row.delivery.mailId ? 'Awaiting delivery' : 'Delivery status unavailable';
  if (!configured || now - row.delivery.started >= retryWindowMs) return 'Email unconfirmed. Share the link manually.';
  return 'Email unconfirmed';
}

export function resendInviteMailer({ key, from, replyTo, fetcher = fetch }) {
  if (!key || !from) return null;
  return async ({ id, email, url, expires, format, tracking }) => {
    try {
      const response = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(4500),
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `come-at-me-invite/${id}`,
        },
        body: JSON.stringify({
          from,
          to: [email],
          reply_to: replyTo || undefined,
          subject: inviteEmailSubject,
          tags: tracking ? [{ name: 'invite_id', value: id }] : undefined,
          html: format === inviteCardFormat ? inviteCard(url, expires) : undefined,
          text: `Your request to try COME AT ME! was approved.\n\nOpen your private invite to play:\n${url}\n\nThe link expires at ${new Date(expires * 1000).toUTCString()}.\n\nDaniel\nZero Page Labs`,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (validMailId(result?.id)) return result.id;
      } else {
        await response.body?.cancel();
        console.warn('Invite mail provider rejected a send', { status: response.status });
        return false;
      }
    } catch (error) {
      console.warn('Invite mail send could not be confirmed', { timedOut: error?.name === 'TimeoutError' });
      return false;
    }
    console.warn('Invite mail provider response did not confirm acceptance');
    return false;
  };
}
