const path = require("path");
const os = require("os");
const fs = require("fs");

// Cross-platform output directory: ~/Documents/TavantDocs
function getOutputDir() {
  const home = os.homedir();
  const docsDir = path.join(home, "Documents", "TavantDocs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  return docsDir;
}

const BRAND = {
  colors: {
    orange: "F36E26",
    black: "000000",
    white: "FFFFFF",
    darkBg: "1A1A1A",
    lightGray: "F5F5F5",
    mediumGray: "666666",
    darkGray: "333333",
  },
  font: "Aptos",
  company: "Tavant",
  footer: "Tavant & Customer Confidential",
  logo: {
    path: path.join(__dirname, "assets", "tavant-logo.png"),
  },
  getOutputDir,
};

module.exports = BRAND;
