import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// יצירת נתיב מוחלט ואמין לקובץ התרחישים
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenarioFile = path.join(__dirname, 'scenarios.txt');

// --- חלק חדש לצורכי דיבאגינג ---
console.log(`[DEBUG] הנתיב המחושב לקובץ התרחישים: ${scenarioFile}`);
if (fs.existsSync(scenarioFile)) {
  console.log('[DEBUG] הקובץ scenarios.txt נמצא בהצלחה.');
} else {
  console.error('[DEBUG] שגיאה קריטית: הקובץ scenarios.txt לא נמצא בנתיב שצוין!');
}
// --- סוף חלק הדיבאגינג ---

const scenarioIndexPerThread = new Map();

export function getNextScenario(threadId, language = 'he') {
  const id = threadId || 'default-thread';

  try {
    const content = fs.readFileSync(scenarioFile, 'utf8');
    const blocks = content.split('================================================================================').filter(b => b.trim() !== '');
    
    if (blocks.length === 0) {
        console.error("[DEBUG] קובץ התרחישים ריק או שלא מכיל את התו המפריד.");
        return { scenario: null };
    }

    const index = scenarioIndexPerThread.get(id) || 0;

    if (index >= blocks.length) {
      scenarioIndexPerThread.set(id, 0); // איפוס להתחלה
      return { scenario: "לא נותרו תרחישים נוספים. חזרנו לתרחיש הראשון." };
    }

    const block = blocks[index];
    scenarioIndexPerThread.set(id, index + 1);

    const langTag = { he: '[HEBREW]', en: '[ENGLISH]', ar: '[ARABIC]' }[language] || '[HEBREW]';
    const regex = new RegExp(`${langTag.replace('[', '\\[').replace(']', '\\]')}([\\s\\S]*?)(?=\\[[A-Z]+\\]|$)`, 'm');
    const match = block.match(regex);
    
    if (!match || !match[1]) {
        console.error(`[DEBUG] לא נמצא תרחיש בשפה '${language}' בבלוק מספר ${index}.`);
        return { scenario: null };
    }
    
    return { scenario: match[1].trim() };

  } catch (error) {
    console.error("[DEBUG] Error in getNextScenario:", error);
    return { scenario: null };
  }
}
