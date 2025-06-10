import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenarioFile = path.join(__dirname, 'scenarios.txt');

console.log(`[DEBUG V2] הנתיב המחושב לקובץ התרחישים: ${scenarioFile}`);
if (!fs.existsSync(scenarioFile)) {
  console.error('[DEBUG V2] שגיאה קריטית: הקובץ scenarios.txt לא נמצא בנתיב שצוין!');
}

const scenarioIndexPerThread = new Map();

export function getNextScenario(threadId, language = 'he') {
  const id = threadId || 'default-thread';
  console.log(`[DEBUG V2] מתחיל את getNextScenario עבור id: ${id}, שפה: ${language}`);

  try {
    const content = fs.readFileSync(scenarioFile, 'utf8');
    const blocks = content.split('================================================================================').filter(b => b.trim() !== '');
    
    if (blocks.length === 0) {
      console.error("[DEBUG V2] קובץ התרחישים ריק או שלא מכיל את התו המפריד.");
      return { scenario: null };
    }

    const index = scenarioIndexPerThread.get(id) || 0;
    console.log(`[DEBUG V2] אינדקס התרחיש הנוכחי: ${index}`);

    if (index >= blocks.length) {
      scenarioIndexPerThread.set(id, 0);
      return { scenario: "לא נותרו תרחישים נוספים. חזרנו לתרחיש הראשון." };
    }

    const block = blocks[index];
    // --- הדפסת דיבאג קריטית ---
    console.log(`[DEBUG V2] תוכן הבלוק (block) שנשלח לעיבוד:\n---\n${block}\n---`);
    scenarioIndexPerThread.set(id, index + 1);

    const langTag = { he: '[HEBREW]', en: '[ENGLISH]', ar: '[ARABIC]' }[language] || '[HEBREW]';
    console.log(`[DEBUG V2] תגית השפה (langTag) לחיפוש: ${langTag}`);
    
    const regex = new RegExp(`${langTag.replace('[', '\\[').replace(']', '\\]')}([\\s\\S]*?)(?=\\[[A-Z]+\\]|$)`, 'm');
    const match = block.match(regex);
    
    if (!match || !match[1]) {
      console.error(`[DEBUG V2] החיפוש נכשל! לא נמצא תרחיש בשפה '${language}' בבלוק שהודפס למעלה.`);
      return { scenario: null };
    }
    
    console.log('[DEBUG V2] החיפוש הצליח! התרחיש חולץ בהצלחה.');
    return { scenario: match[1].trim() };

  } catch (error) {
    console.error("[DEBUG V2] אירעה שגיאה קריטית במהלך קריאת הקובץ:", error);
    return { scenario: null };
  }
}
