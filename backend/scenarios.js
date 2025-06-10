import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenarioFile = path.join(__dirname, 'scenarios.txt');

const scenarioIndexPerThread = new Map();

export function getNextScenario(threadId, language = 'he') {
  const id = threadId || 'default-thread';

  try {
    const content = fs.readFileSync(scenarioFile, 'utf8');
    const blocks = content.split('================================================================================').filter(b => b.trim() !== '');
    
    if (blocks.length === 0) return { scenario: null };

    const index = scenarioIndexPerThread.get(id) || 0;

    if (index >= blocks.length) {
      scenarioIndexPerThread.set(id, 0);
      return { scenario: "לא נותרו תרחישים נוספים. חזרנו לתרחיש הראשון." };
    }
    
    const block = blocks[index].trim().replace(/^\uFEFF/, '');
    scenarioIndexPerThread.set(id, index + 1);

    const langTag = { he: '[HEBREW]', en: '[ENGLISH]', ar: '[ARABIC]' }[language] || '[HEBREW]';
    
    // התיקון הסופי: הסרת הדגל 'm' מה-Regex
    const regex = new RegExp(`\\s*${langTag.replace('[', '\\[').replace(']', '\\]')}\\s*([\\s\\S]*?)(?=\\s*\\[[A-Z]+\\]|$)`);
    const match = block.match(regex);
    
    if (!match || !match[1]) {
      const fallbackRegex = new RegExp(`\\[HEBREW\\]([\\s\\S]*?)(?=\\s*\\[[A-Z]+\\]|$)`);
      const fallbackMatch = block.match(fallbackRegex);
      return { scenario: fallbackMatch && fallbackMatch[1] ? fallbackMatch[1].trim() : null };
    }
    
    return { scenario: match[1].trim() };

  } catch (error) {
    console.error("Error in getNextScenario:", error);
    return { scenario: null };
  }
}
