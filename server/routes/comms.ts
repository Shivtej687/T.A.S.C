import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export async function handleCommsChat(req: Request, res: Response, ai: GoogleGenAI | null) {
  try {
    const { contactName, contactRole, contactCategory, userMessage, history } = req.body;

    if (!contactName || !userMessage) {
      return res.status(400).json({ error: 'contactName and userMessage are required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'AI service unavailable' });
    }

    const systemInstruction = `
You are roleplaying as "${contactName}", who holds the rank/position of "${contactRole}" in the Government of India / Defence Forces / Law Enforcement.
You are communicating over T.A.S.C. Level-7 Encrypted Communications Channel with Commander Shivtej (User).

CRITICAL CONVERSATIONAL & PERSONA RULES:
1. NEVER output generic system strings like "Acknowledged. Processing secure packet.", "ACK", or robotic network statements.
2. Speak like a real human officer matching your specific rank, position, authority, and military or law-enforcement domain:
   - GREETING INTENT (e.g. "hi", "hello", "hey", "good morning", "jai hind", "namaste", "sir"):
     Respond naturally and realistically according to your rank! E.g.:
     - General / Defence Chief: "Jai Hind, Commander Shivtej. What is the situation?"
     - IPS / Police Officer / Director: "Hello Commander. What is the matter?"
     - Constable / Field Operative: "Jai Hind Sir! Constable reporting. What is the assignment?"
     - Prime Minister / NSA: "Good day, Commander. What matter requires my attention?"
     Always follow up by asking them to specify the situation or matter!
   - SITUATION SPECIFIED (when user describes an event, threat, suspect, movement, request for backup, etc.):
     Respond realistically in character! Acknowledge the report, ask for specific coordinates/suspect IDs/tactical details, or issue operational instructions and dispatch forces.
3. Keep response concise, natural, and realistic for secure chat (1 to 3 sentences, maximum 60 words).
4. Do NOT break character. Stay 100% in character.
`;

    let promptText = `Chat History:\n`;
    if (Array.isArray(history)) {
      history.slice(-6).forEach((m: any) => {
        promptText += `${m.senderId === 'me' ? 'Commander Shivtej' : contactName}: ${m.text}\n`;
      });
    }
    promptText += `Commander Shivtej: ${userMessage}\n${contactName}:`;

    let responseText = '';
    const modelsToTry = ['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        if (response && response.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (mErr: any) {
        console.log(`[Diagnostic] Comms fallback option evaluated for ${modelName}.`);
      }
    }

    if (!responseText) {
      const isGreeting = /^(hi|hello|hey|namaste|jai hind|good morning|sir)\b/i.test(userMessage.trim());
      if (contactCategory === 'DEFENCE') {
        responseText = isGreeting ? 'Jai Hind, Commander Shivtej! What is the situation?' : 'Understood Commander Shivtej! Forces alerted. What are the grid coordinates?';
      } else if (contactCategory === 'FIELD') {
        responseText = isGreeting ? 'Jai Hind Sir! Reporting on duty. What is the situation?' : 'Copy Sir! Standing by for your order on the field.';
      } else {
        responseText = isGreeting ? 'Hello Commander. What is the matter?' : 'Understood Commander Shivtej. Please specify the situation so we can proceed.';
      }
    }

    return res.json({ reply: responseText });
  } catch (err: any) {
    console.error('Comms Chat Error:', err);
    return res.status(200).json({ reply: 'Hello Commander Shivtej. What is the matter?' });
  }
}
