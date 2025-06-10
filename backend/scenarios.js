import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// יצירת נתיב מוחלט שתמיד עובד, גם על השרת
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenarioFile = path.join(__dirname, 'scenarios.txt');

const scenarioIndexPerThread = new Map();

export function getNextScenario(threadId, language = 'he') {
  const id = threadId || 'default-thread';

  try {
    const content = fs.readFileSync(scenarioFile, 'utf8');
    const blocks = content.split('================================================================================').filter(b => b.trim() !== '');
    const index = scenarioIndexPerThread.get(id) || 0;

    if (index >= blocks.length) {
      // איפוס האינדקס אם הגענו לסוף הרשימה
      scenarioIndexPerThread.set(id, 0);
      return { scenario: "לא נותרו תרחישים נוספים. חזרנו לתרחיש הראשון." };
    }

    const block = blocks[index];
    scenarioIndexPerThread.set(id, index + 1);

    const langTag = {
      he: '[HEBREW]',
      en: '[ENGLISH]',
      ar: '[ARABIC]',
    }[language] || '[HEBREW]';

    const regex = new RegExp(`${langTag.replace('[', '\\[').replace(']', '\\]')}([\\s\\S]*?)(?=\\[[A-Z]+\\]|$)`, 'm');
    const match = block.match(regex);
    
    return {
      scenario: match && match[1] ? match[1].trim() : null,
    };

  } catch (error) {
    console.error("Error reading or parsing scenarios.txt:", error);
    return { scenario: "אירעה שגיאה בטעינת התרחיש." };
  }
}
