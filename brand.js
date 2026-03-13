const path = require("path");

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
};

module.exports = BRAND;
