// Auto-check for needed log entries
require('./auto-log-check.js');

// ========================================
// SESSION TRACKING AND PROGRESS LOGGING
// ========================================
//
// PURPOSE:
// Tracks AI assistant sessions and automatically generates progress log entries
// when session count reaches threshold (every 5 sessions)
//
// HOW IT WORKS:
// 1. Reads PROJECT-PROGRESS-LOG.md and finds "Session Counter: X" at top
// 2. Increments counter by 1 each time script is run
// 3. When counter reaches 5:
//    - Auto-generates a basic log entry with date, git commits, placeholder text
//    - Resets counter to 0
// 4. Updates the log file with new counter value
//
// LIMITATIONS:
// - Auto-generated entries are generic and don't capture actual progress
// - No evidence requirements or validation of claims
// - Creates placeholder text that may not reflect real accomplishments
//
// USAGE:
// Run at session start: node ai-session-tools/log-increment.js
// (As specified in SESSION-INIT.md)
//
// ========================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOG_FILE = path.join(__dirname, '..', 'PROJECT-PROGRESS-LOG.md');

function incrementLog() {
  let content = fs.readFileSync(LOG_FILE, 'utf8');
  let counterMatch = content.match(/Session Counter: (\d+)/);
  if (!counterMatch) {
    content = 'Session Counter: 0\n\n' + content;
    fs.writeFileSync(LOG_FILE, content);
    counterMatch = [null, '0'];
  }
  let counter = parseInt(counterMatch[1]);
  counter++;
  content = content.replace(/Session Counter: \d+/, `Session Counter: ${counter}`);
  fs.writeFileSync(LOG_FILE, content);

  if (counter >= 5) {
    // Auto-generate basic entry
    const date = new Date().toISOString();
    const recentCommits = execSync('git log -n 3 --oneline').toString().trim() || '[No recent commits]';
    const entry = `\n\n# Log Entry (#${Date.now()})\n- Date: ${date}\n- Goal: Automated session summary (review conversation for details)\n- Actions: Incremented counter; Recent commits: ${recentCommits}\n- Key Decisions: [Add if needed]\n- Files Modified: [List if known]\n- Status: In Progress\n- Next Steps: Continue session tasks\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log('Auto-generated log entry added! Resetting counter.');
    content = content.replace(/Session Counter: \d+/, 'Session Counter: 0');
    fs.writeFileSync(LOG_FILE, content);
  } else {
    console.log(`Counter incremented to ${counter}`);
  }
}

incrementLog(); 