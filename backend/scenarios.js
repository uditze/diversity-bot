import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// יצירת נתיב מוחלט ואמין לקובץ התרחישים
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenarioFile = path.join(__dirname, 'scenarios.txt');

const scenarioIndexPerThread = new Map();

export function getNextScenario(threadId, language = 'he') {
  const id = threadId || 'default-thread';

  try {
    const content = fs.readFileSync(scenarioFile, 'utf8');
    // הפרדה לפי התו המפריד וסינון בלוקים ריקים
    const blocks = content.split('================================================================================').filter(b => b.trim() !== '');
    
    if (blocks.length === 0) {
      return { scenario: null };
    }

    const index = scenarioIndexPerThread.get(id) || 0;

    if (index >= blocks.length) {
      scenarioIndexPerThread.set(id, 0); // איפוס להתחלה
      return { scenario: "לא נותרו תרחישים נוספים. חזרנו לתרחיש הראשון." };
    }

    // *** התיקון הקריטי כאן: הסרת רווחים ותווים נסתרים מהבלוק ***
    const block = blocks[index].trim(); 
    
    scenarioIndexPerThread.set(id, index + 1);

    const langTag = { he: '[HEBREW]', en: '[ENGLISH]', ar: '[ARABIC]' }[language] || '[HEBREW]';
    const regex = new RegExp(`${langTag.replace('[', '\\[').replace(']', '\\]')}([\\s\\S]*?)(?=\\[[A-Z]+\\]|$)`, 'm');
    const match = block.match(regex);
    
    if (!match || !match[1]) {
      // אם לא נמצאה התאמה, ננסה לחפש בעברית כברירת מחדל
      const fallbackRegex = new RegExp(`\\[HEBREW\\]([\\s\\S]*?)(?=\\[[A-Z]+\\]|$)`, 'm');
      const fallbackMatch = block.match(fallbackRegex);
      if (fallbackMatch && fallbackMatch[1]) {
        return { scenario: fallbackMatch[1].trim() };
      }
      return { scenario: null };
    }
    
    return { scenario: match[1].trim() };

  } catch (error) {
    console.error("Error in getNextScenario:", error);
    return { scenario: null };
  }
}
