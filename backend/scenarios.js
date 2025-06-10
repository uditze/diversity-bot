import fs from 'fs';
import path from 'path';

const scenarioFile = path.resolve('scenarios.txt');

// מבנה פשוט לשמירת מיקום לפי thread
const scenarioIndexPerThread = new Map();

export function getNextScenario(threadId, language = 'he') {
  const content = fs.readFileSync(scenarioFile, 'utf8');

  const blocks = content.split('================================================================================');
  const index = scenarioIndexPerThread.get(threadId) || 0;

  if (index >= blocks.length) {
    return { scenario: null };
  }

  const block = blocks[index];
  scenarioIndexPerThread.set(threadId, index + 1);

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
