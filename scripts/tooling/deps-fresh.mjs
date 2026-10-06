// Exit 0 when node_modules is installed and at least as new as package-lock.json, else 1.
// startup.bat runs `npm install` only when this says the install is missing or stale.
import { statSync } from "node:fs";

try {
  const lock = statSync("package-lock.json").mtimeMs;
  // npm writes node_modules/.package-lock.json at the end of every successful install
  const installed = statSync("node_modules/.package-lock.json").mtimeMs;
  process.exit(installed >= lock ? 0 : 1);
} catch {
  process.exit(1);
}
