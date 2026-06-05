#!/usr/bin/env node
// Sync htmlwidgets yaml dependency versions with actual node_modules versions.
// Run after `npm install` or package upgrades: node update-yaml-versions.js
const fs = require("fs");
const path = require("path");

// Maps yaml dep name → npm package name (null = internal build, skip)
const DEP_PKG_MAP = {
  "react":        "react",
  "react-dom":    "react-dom",
  "dayjs":        "dayjs",
  "antd-cssinjs": "@ant-design/cssinjs",
  "antd-icons":   "@ant-design/icons",
  "antd":         "antd",
  "antdx":        "@ant-design/x",
  "x-markdown":   "@ant-design/x-markdown",
  "x-card":       "@ant-design/x-card",
  "mermaid-lib":  "mermaid",
  // x-sdk-vendor is our own IIFE build — version managed in DESCRIPTION/build-all.js
};

function pkgVersion(pkg) {
  const pkgJson = path.join(__dirname, "node_modules", pkg, "package.json");
  return JSON.parse(fs.readFileSync(pkgJson, "utf8")).version;
}

const versions = {};
for (const [alias, pkg] of Object.entries(DEP_PKG_MAP)) {
  try {
    versions[alias] = pkgVersion(pkg);
  } catch {
    console.warn(`WARNING: ${pkg} not found in node_modules, skipping`);
  }
}

const yamlDir = path.join(__dirname, "inst", "htmlwidgets");
let totalUpdated = 0;

for (const file of fs.readdirSync(yamlDir).filter(f => f.endsWith(".yaml"))) {
  const filePath = path.join(yamlDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  for (const [alias, newVer] of Object.entries(versions)) {
    // Match: "  - name: <alias>\n    version: <old>"
    const re = new RegExp(
      `(  - name: ${alias}\\n    version: )([^\\n]+)`,
      "g"
    );
    content = content.replace(re, (_, prefix, oldVer) => {
      if (oldVer.trim() !== newVer) {
        changed = true;
        console.log(`  ${file}: ${alias} ${oldVer.trim()} → ${newVer}`);
      }
      return prefix + newVer;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    totalUpdated++;
  }
}

console.log(`\nDone. ${totalUpdated} file(s) updated.`);
