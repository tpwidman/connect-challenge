const _ = require('lodash');
const words = require('./words.json');
const log = require('./logUtil')
/**
 * @param {String} digits numbers to convert to letters, then if a word is found is returned in output
 * @return {Array} Words from dictionary from digits
 */
function findLetterCombinations(digits){
    // if there are somehow not any digits
    if(!digits.length) return [];
    // if there is a character that is not included in the mapping return an empty array
    if(digits.includes('0') || digits.includes('1')) return [];
    // this map will allow us to find the combinations of letters from the numbers
    let map = {
        2: ['a', 'b', 'c'],
        3: ['d', 'e', 'f'],
        4: ['g', 'h', 'i'],
        5: ['j', 'k', 'l'],
        6: ['m', 'n', 'o'],
        7: ['p', 'q', 'r', 's'],
        8: ['t', 'u', 'v'],
        9: ['w', 'x', 'y', 'z'],
    }
    let result = [];
    // function to calculate if the output string is a word from the dictionary
    // if the word is found, return the word and the index from the dictionary
    function letterCombinationsRecursive(string, index) {
        if(index === digits.length) {
            if(words.indexOf(string) > -1){
                result.push({
                    index: words.indexOf(string),
                    word: string.toUpperCase()
                });
            }
            return;
        }
        for(let x of map[digits[index]]) {
            letterCombinationsRecursive(string + x, index + 1);
        }
    }
    letterCombinationsRecursive('', 0);
    return result;
}
/**
 * @param {String} digits String of digits to digest
 * @returns {String[]} Strings with output words, word combinations, or words and digits
 */
function findWordCombinations(digits){
    log.info(`Digits: ${digits}`);
    //TODO include 3 word combinations
    let result = [];
    // loop through the digits and combine
    // find all the letter/word combinations
    // also combining their indexes for sorting by most popular
    var numbersAndWords = {};
    for(i = 0; i <= digits.length; i++){
        let firstHalf = findLetterCombinations(digits.slice(0, i));
        let secondHalf = findLetterCombinations(digits.slice(i));
        for(j = 0; j <= firstHalf.length; j++){
           for(k = 0; k <= secondHalf.length; k++){
                let currentWord = firstHalf[j];
                let currentMatch = secondHalf[k];
                if(currentWord && currentWord.word.length === digits.length){
                    result.push(currentWord);
                }
                if(currentWord && currentMatch){
                    let combinedWord = {
                        index: currentWord.index + currentMatch.index,
                        word: currentWord.word + currentMatch.word
                    }
                    result.push(combinedWord);
                }
                // this finds the possible word and digit combinations
                // if there are not enough words or word combinations
                if(currentWord && currentWord.word.length < digits.length){
                    numbersAndWords[currentWord.word] = currentWord.word + digits.slice(i);
                }
                if(currentMatch && currentMatch.word.length < digits.length){
                    numbersAndWords[currentMatch.word] = digits.slice(0, i) + currentMatch.word;
                }
           }
        }
    }
    // If there are not enough word combinations, we want to return the numbers & words sorted by length of word
    // Ex: like 810BIRD if there were not enough combinations
    const arrayOfKeys = Object.keys(numbersAndWords).sort((a, b) => b.length - a.length);
    const values = arrayOfKeys.map(key => numbersAndWords[key]);
    return result
        .sort((a, b) => a.index - b.index)
        .map(item => item.word)
        .concat(values);
}
/**
 * @param {*} initialNumber 
 * @returns Object mapping of a phone number deconstructed
 */
function parsePhoneNumber(initialNumber){
    const phoneNumber = initialNumber.slice(-7);
    const prefix = phoneNumber.slice(0, 3);
    const lineNumber = phoneNumber.slice(3);
    return {
        phoneNumber,
        prefix,
        lineNumber
    };
};
/**
 * 
 * @param {*} initialNumber 
 */
function getVanity(initialNumber){
    const { phoneNumber } = parsePhoneNumber(initialNumber);
    const combinations = findWordCombinations(phoneNumber);
    const bestFive = combinations.slice(0, 5);
    log.info(`Best words: ${bestFive.join(', ')}`);
    return bestFive;
}
module.exports = {
    findLetterCombinations,
    findWordCombinations,
    parsePhoneNumber,
    getVanity
}