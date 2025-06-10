import fs from 'fs';
import path from 'path';

const scenarioFile = path.resolve('scenarios.txt');

// מבנה פשוט לשמירת מיקום לפי thread
const scenarioIndexPerThread = new Map();

export function getNextScenario(threadId, language = 'he') {
  const id = threadId || 'default-thread'; // ✅ טיפול במקרה שאין threadId

  const content = fs.readFileSync(scenarioFile, 'utf8');
  const blocks = content.split('================================================================================');
  const index = scenarioIndexPerThread.get(id) || 0;

  if (index >= blocks.length) {
    return { scenario: null };
  }

  const block = blocks[index];
  scenarioIndexPerThread.set(id, index + 1);

  const langTag = {
    he: '[HEBREW]',
    en: '[ENGLISH]',
    ar: '[ARABIC]',
  }[language] || '[HEBREW]';

  const match = block.match(new RegExp(`${langTag}[\\s\\S]*?(?=\\[|$)`));
  return {
    scenario: match ? match[0].replace(langTag, '').trim() : null,
  };
}
