export interface SlackIncidentPayload {
  incidentId: string;
  location: string;
  details: string;
  severity?: string;
  escalationAction: string;
  resolver: string;
  timestamp: string;
}

export async function notifySlack(
  webhookUrl: string,
  payload: SlackIncidentPayload,
): Promise<void> {
  const severityEmoji: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };
  const emoji = payload.severity ? (severityEmoji[payload.severity] ?? '⚪') : '🚨';

  const body = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${emoji} Security Incident Escalated` },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Location:*\n${payload.location}` },
          { type: 'mrkdwn', text: `*Action:*\n${payload.escalationAction}` },
          { type: 'mrkdwn', text: `*Resolver:*\n${payload.resolver}` },
          { type: 'mrkdwn', text: `*Time:*\n${payload.timestamp}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Details:*\n${payload.details}` },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Incident ID: \`${payload.incidentId}\`` }],
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Slack webhook error: ${res.status}`);
  }
}
