// Waits until the local site answers, then opens it in the default browser.
// startup.bat starts this in the background just before the server, so the browser opens
// on a page that is actually ready (a production build can take a minute or two first).
// usage: node scripts/tooling/open-when-ready.mjs <port> [--print-only]
import { spawn } from "node:child_process";
import http from "node:http";

const port = Number(process.argv[2]);
const printOnly = process.argv.includes("--print-only");
const url = `http://localhost:${port}`;
const deadline = Date.now() + 10 * 60_000;

// plain http (not fetch): any HTTP answer, even a 404 or 500, means the server is listening
const answers = () =>
  new Promise((resolve) => {
    const req = http.get(url, (res) => { res.resume(); resolve(true); });
    req.setTimeout(3000, () => req.destroy());
    req.on("error", () => resolve(false));
  });

const open = () => {
  process.stdout.write(`\n  Site is ready: ${url}\n\n`);
  if (printOnly) return;
  const [cmd, args] =
    process.platform === "win32" ? ["cmd", ["/c", "start", '""', url]]
    : process.platform === "darwin" ? ["open", [url]]
    : ["xdg-open", [url]];
  spawn(cmd, args, { stdio: "ignore", detached: true, windowsVerbatimArguments: true }).on("error", () => {}).unref();
};

while (Date.now() < deadline) {
  if (await answers()) {
    open();
    process.exit(0);
  }
  await new Promise((r) => setTimeout(r, 750));
}
process.stdout.write(`  (gave up waiting for ${url}; open it manually once the server is up)\n`);
