/**
 * Project root entry: starts only the React dev server.
 * Run: node index.js   (same as npm start)
 */
const { spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname);
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

const child = spawn(npmCmd, ["run", "start"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(typeof code === "number" ? code : 0);
});
