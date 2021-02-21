const fs = require("fs");
const check = require("wordlist-english");

const englishWords = check.english;
const { words } = require("./word-dictionary.json");

const filtered = words.filter(
  (word) => word.length <= 7 && englishWords.indexOf(word) > -1
);
fs.writeFileSync("./words.json", JSON.stringify(filtered, null, 2));
