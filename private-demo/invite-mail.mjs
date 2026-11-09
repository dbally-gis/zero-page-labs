const retryWindowMs = 23 * 60 * 60 * 1000;

export function deliveryStatus(row, configured, now = Date.now()) {
  if (!row.delivery) return null;
  if (row.delivery.accepted) return 'Accepted by mail provider';
  if (!configured || now - row.delivery.started >= retryWindowMs) return 'Email unconfirmed. Share the link manually.';
  return 'Email unconfirmed';
}

export function resendInviteMailer({ key, from, replyTo, fetcher = fetch }) {
  if (!key || !from) return null;
  return async ({ id, email, url, expires }) => {
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
          subject: 'Your COME AT ME! playtest invite',
          text: `Your request to try COME AT ME! was approved.\n\nOpen your private invite to play:\n${url}\n\nThe link expires at ${new Date(expires * 1000).toUTCString()}.\n\nDaniel\nZero Page Labs`,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (typeof result?.id === 'string' && result.id.length > 0) return true;
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
