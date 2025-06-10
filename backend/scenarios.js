import fs from 'fs';
import path from 'path';

const scenarioFile = path.resolve('scenarios.txt');
const scenarioIndexPerThread = new Map();

export function getNextScenario(threadId, language = 'he') {
  const id = threadId || 'default-thread';

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

  // חיפוש קטע השפה
  let match = block.match(new RegExp(`${langTag}[\\s\\S]*?(?=(\\[[A-Z]+\\]|$))`, 'm'));

  // fallback לעברית אם לא נמצא בשפה המבוקשת
  if (!match && langTag !== '[HEBREW]') {
    match = block.match(new RegExp(`\\[HEBREW\\][\\s\\S]*?(?=(\\[[A-Z]+\\]|$))`, 'm'));
  }

  return {
    scenario: match ? match[0].replace(langTag, '').replace(/\[HEBREW\]/, '').trim() : null,
  };
}
