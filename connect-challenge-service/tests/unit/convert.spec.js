const test = require('ava');
const _ = require('lodash');
const {
    findLetterCombinations,
    findWordCombinations
} = require('../../lib/convert');

test.serial('Testing findLetterCombinations to test input digits', async t => {
    // 228 would spell cat so if so it should be included
    t.true(findLetterCombinations("228").map(x => x.word).includes("CAT"));
    t.true(findLetterCombinations("7765328").map(x => x.word).includes("PROJECT"));

    // t.true(findLetterCombinations(null).length === 0)
    t.true(findLetterCombinations("1111111").length === 0)
    t.true(findLetterCombinations("1").length === 0);
});
test.only('Testing findWordCombinations to test input digits', async t => {
    const result = findWordCombinations("7765328");
    t.deepEqual(result[0], 'PROJECT');
    t.true(result.every(val => _.isString(val)));
    t.pass();
})