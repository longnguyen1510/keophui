const fs = require('fs');
const lines = fs.readFileSync('/Users/macbook/.gemini/antigravity/brain/52df2e17-5a75-4819-aafa-240b559429cb/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 15185) {
      // Step 15185 contains the CODE_ACTION that says "The following changes were made..."
      // Oh wait, 15185 is the tool RESULT.
      // The tool CALL is in 15184. Let's look for step_index 15184.
    }
    if (obj.step_index === 15184 && obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.name === 'replace_file_content') {
           fs.writeFileSync('extracted_content_decoded.txt', call.args.ReplacementContent, 'utf8');
           console.log("Extracted successfully!");
        }
      }
    }
  } catch (e) {}
}
