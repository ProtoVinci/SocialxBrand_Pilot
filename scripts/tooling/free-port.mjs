// Prints the first free TCP port at or above the given one (default 3100).
// Used by startup.bat so a busy port (another project on 3000/3100) never blocks the launch.
// usage: node scripts/tooling/free-port.mjs [startPort]
import net from "node:net";

const start = Number(process.argv[2] ?? 3100);
if (!Number.isInteger(start) || start < 1 || start > 65535) {
  console.error(`free-port: "${process.argv[2]}" is not a valid port`);
  process.exit(2);
}

const isFree = (port) =>
  new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    // no host: listens on :: (dual-stack) like Next does, so IPv4 and IPv6 holders both count
    srv.listen(port, () => srv.close(() => resolve(true)));
  });

for (let port = start; port < Math.min(start + 50, 65536); port++) {
  if (await isFree(port)) {
    process.stdout.write(`${port}\n`); // plain write: console.log touches stderr for colour detection
    process.exit(0);
  }
}
console.error(`free-port: no free port in ${start}-${start + 49}`);
process.exit(1);
