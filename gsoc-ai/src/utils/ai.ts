export interface TriageResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedStatus: 'open' | 'dismissed' | 'escalated' | 'resolved';
  suggestedDismissalReason: string | null;
  suggestedEscalation: string | null;
  summary: string;
  tags: string[];
}

export async function triageIncident(
  details: string,
  source: string,
  location: string,
  apiKey: string,
): Promise<TriageResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `You are an expert security operations center analyst for a retail chain. Analyze this incident and respond ONLY with a valid JSON object (no markdown, no explanation).

Source: ${source}
Location: ${location}
Details: ${details}

JSON fields:
{
  "severity": "low"|"medium"|"high"|"critical",
  "suggestedStatus": "open"|"dismissed"|"escalated"|"resolved",
  "suggestedDismissalReason": string or null (e.g. "False Alarm", "Non-Urgent"),
  "suggestedEscalation": string or null (e.g. "Contact Police", "Dispatch Security", "Call Manager"),
  "summary": "one concise sentence",
  "tags": ["up", "to", "five", "tags"]
}`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data.content[0].text.trim();

  try {
    return JSON.parse(text) as TriageResult;
  } catch {
    // Try to extract JSON if wrapped in text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as TriageResult;
    throw new Error('Failed to parse AI response as JSON');
  }
}
