# Amazon Connect Challenge
This AWS Lambda repository solitary function is to generate vanity numbers from an incoming call when used inside a Contact flow on Amazon Connect.
```
┌── lib
│   ├── convert.js            <-- group of functions for generating vanity numbers
│   ├── dbMethods.js          <-- function for putItem in dynamodb
│   ├── logUtil.js            <-- shared log utility
│   ├── updateList.js         <-- script used to filter dictionary
│   ├── word-dictionary.json  <-- raw dictionary json
│   └── words.json            <-- dictionary of words sorted by popular use
├── tests
│   └── unit
│      ├── convert.spec.js    <-- unit tests for convert functions
│      └── index.spec.js      <-- unit tests for index file
├── .prettierrc               <-- prettier configuration
├── .eslintrc                 <-- eslint configuration
├── index.js                  <-- primary handler for Lambda function
├── package.json              <-- projects dependencies
├── package-lock.json         <-- projects dependencies
└── README.md                 <-- documentation
```
# Setup 


# Requirements
>Create a Lambda that converts phone numbers to vanity numbers and save the best 5 resulting vanity numbers and the caller's number in a DynamoDB table. "Best" is defined as you see fit - explain your thoughts.

In order to satisfy the "Best" requirement, a dictionary of terms was downloaded from [an external repository](https://github.com/tkoop/popular-english-words#readme). This list of terms is a large list of words from Wikipedia ordered by popularity. As these are already ordered, the function to check if a combination of numbers would output a word can take advantage of the index in the dictionary. 

# Program sequence
The lambda service should perform the following in sequence:
1. Obtain the phone number from the event request json
2. Find all the possible words from the phone number
	* ex: 1-800-228-2473 => 1-800-CAT-BIRD or 1-800-ACT-BIRD
3. Look in the dictionary for these words
4. Return in either the order that appears in the dictionary
	* If there are not enough words available, return words and digits 
	* ex: 1-800-810-2473 => 1-800-810-BIRD
	* Because these tend to be smaller words where not available, The sort is by longest word in the string.
5. Store these in Dynamo, if there is an error here, log the error and return the numbers back. 
6. Return a set of the 3 most popular word/digit as a return to be processed by Amazon Connect as a string joined by commas.

# Potential improvements
The lambda service is heavily dependent on the dictionary of terms for determining a best fit. This is not a perfect solution. Different words have different weights when combined together. Adjectives and nouns combined together possibly would provide a better fit than say two nouns.
* Ex: 1-800-CAT-BIRD is probably less valuable than 1-800-BIG-BIRD

Also, theres a case of where proper nouns or acronyms would likely be way more valuable than words like prepositions or contractions if you were to add those to the dictionary too. 
* Ex: 1-800-AMC-HELP is probably more valuable than 1-800-BOB-HELP

Caching is not implemented either. Data could be either retrieved from dynamo or for instance if the lambda is still warm, returned from it's own memory, and not do excessive db writes. The in-memory cache could be implemented like: 
``` javascript
//cache
let number; //<-- above function
let bestVanityNumbers;
function handler(event){
	// ...
	if(number === event.Details.ContactData.CustomerEndpoint.Address){
		return {
			VanityNumbersList: bestVanityNumbers.slice(0, 3).join(', ')
		}
	}
	number = event.Details.ContactData.CustomerEndpoint.Address;
	bestVanityNumbers = getVanityNumbers(number);
	//...
}
```