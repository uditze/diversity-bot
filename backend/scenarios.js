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
    
    if (blocks.length === 0) return { scenario: null, scenarioId: null };

    const index = scenarioIndexPerThread.get(id) || 0;

    if (index >= blocks.length) {
      scenarioIndexPerThread.set(id, 0);
      return { scenario: "לא נותרו תרחישים נוספים. חזרנו לתרחיש הראשון.", scenarioId: 0 };
    }
    
    const block = blocks[index].trim().replace(/^\uFEFF/, '');
    scenarioIndexPerThread.set(id, index + 1);

    const langTags = { he: '[HEBREW]', en: '[ENGLISH]', ar: '[ARABIC]' };
    const requestedTag = langTags[language] || langTags['he'];

    const regex = new RegExp(`\\s*${requestedTag.replace('[', '\\[').replace(']', '\\]')}\\s*([\\s\\S]*?)(?=\\s*\\[[A-Z]+\\]|$)`);
    let match = block.match(regex);
    
    if (!match && language !== 'he') {
      const fallbackRegex = new RegExp(`\\s*\\[HEBREW\\]\\s*([\\s\\S]*?)(?=\\s*\\[[A-Z]+\\]|$)`);
      match = block.match(fallbackRegex);
    }
    
    // ✅ מחזירים עכשיו גם את האינדקס של התרחיש
    return { 
      scenario: match && match[1] ? match[1].trim() : null,
      scenarioId: index 
    };

  } catch (error) {
    console.error("Error in getNextScenario:", error);
    return { scenario: null, scenarioId: null };
  }
}
