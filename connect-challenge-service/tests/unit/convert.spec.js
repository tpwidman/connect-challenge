const test = require('ava');
const convert = require('../../lib/convert');

test.serial('Testing findLetterCombinations to test input digits', async t => {
    // 228 would spell cat so if so it should be included
    // t.log(convert.findLetterCombinations("228").map(x => x.word).includes("cat"));
    t.log(convert.findLetterCombinations("1111111"))
    t.true(convert.findLetterCombinations("1").length == 0);
});