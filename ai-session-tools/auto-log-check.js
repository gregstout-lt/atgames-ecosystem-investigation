// ========================================
// AUTOMATIC LOG ENTRY CHECKING SYSTEM
// ========================================
//
// PURPOSE:
// Automatically checks if a progress log entry is needed based on time elapsed
// Runs automatically when this module is imported by any script
//
// HOW IT WORKS:
// 1. Checks timestamp of last log entry in PROJECT-PROGRESS-LOG.md
// 2. Calculates time elapsed since last entry
// 3. If 15+ minutes have passed, prompts for evidence-based log entry
// 4. Provides specific, concrete prompts to prevent subjective claims
//
// USAGE:
// Add this line to the top of any script:
// require('./ai-session-tools/auto-log-check.js');
// (or require('./path/to/ai-session-tools/auto-log-check.js') depending on location)
//
// INTEGRATION:
// Should be added to all key scripts that are commonly run during development
//
// ========================================

const fs = require('fs');
const path = require('path');

const MINUTES_THRESHOLD = 15;
const LOG_FILE = path.join(__dirname, '..', 'PROJECT-PROGRESS-LOG.md');

function checkLogNeed() {
  try {
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    
    // Look for the most recent log entry with a timestamp
    // Format: "## Entry #XXX - Title" followed by date
    const entries = content.split('## Entry #').slice(1); // Remove everything before first entry
    
    if (entries.length === 0) {
      // No entries yet, always prompt
      showLogPrompt("No previous log entries found");
      return;
    }
    
    // Get the first (most recent) entry
    const latestEntry = entries[0];
    
    // Look for various timestamp patterns that might exist
    const datePatterns = [
      /Date: (.+)/,                    // Explicit date field
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/,  // ISO timestamp
      /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/         // Simple datetime
    ];
    
    let lastLogTime = null;
    
    for (const pattern of datePatterns) {
      const match = latestEntry.match(pattern);
      if (match) {
        lastLogTime = new Date(match[1]).getTime();
        break;
      }
    }
    
    // If no timestamp found, use file modification time as fallback
    if (!lastLogTime || isNaN(lastLogTime)) {
      const stats = fs.statSync(LOG_FILE);
      lastLogTime = stats.mtime.getTime();
    }
    
    const minutesSinceLastLog = (Date.now() - lastLogTime) / (1000 * 60);
    
    if (minutesSinceLastLog >= MINUTES_THRESHOLD) {
      showLogPrompt(`${Math.round(minutesSinceLastLog)} minutes since last log entry`);
    }
    
  } catch (error) {
    // Silently fail if log file doesn't exist or can't be read
    // This prevents script failures when the system is being set up
  }
}

function showLogPrompt(reason) {
  console.log("\n" + "=".repeat(70));
  console.log("🕐 PROGRESS LOG ENTRY NEEDED");
  console.log(`Reason: ${reason}`);
  console.log("");
  console.log("Please provide evidence-based progress update:");
  console.log("• Current implementation plan step (reference specific step):");
  console.log("• Files created/modified since last log (list actual filenames):");
  console.log("• Commands executed with their results (copy/paste outputs):");
  console.log("• Specific errors encountered (exact error messages):");
  console.log("• Next concrete step in the plan:");
  console.log("• Git commits made (commit hashes and messages):");
  console.log("");
  console.log("Add entry manually to PROJECT-PROGRESS-LOG.md using evidence-based format");
  console.log("=".repeat(70) + "\n");
}

// Run the check immediately when this module is imported
checkLogNeed();

module.exports = { checkLogNeed, showLogPrompt };
