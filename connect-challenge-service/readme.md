# Amazon Connect Challenge
This AWS Lambda repository solitary function is to generate vanity numbers from an incoming call when used inside a Contact flow on Amazon Connect.
```
┌── lib
│   ├── convert.js            <-- group of functions for generating vanity numbers
│   ├── dbMethods.js          <-- function for putItem in dynamodb
│   ├── logUtil.js            <-- shared log utility
│   └── words.json            <-- dictionary of words sorted by popular use
├── tests
│   └── unit
│      ├── sample-connect-event.json    <-- sample event to use
│      ├── convert.spec.js    <-- unit tests for convert functions
│      └── index.spec.js      <-- unit tests for index file
├── .prettierrc               <-- prettier configuration
├── .eslintrc                 <-- eslint configuration
├── index.js                  <-- primary handler for Lambda function
├── package.json              <-- projects dependencies
├── package-lock.json         <-- projects dependencies
└── README.md                 <-- documentation
```

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
5. Store these in Dynamo, if there is an error here, log the error and end the call.
6. Return a set of the 3 most popular word/digit as a return to be processed by Amazon Connect as a string joined by commas.

# Potential improvements
The lambda service is heavily dependent on the dictionary of terms for determining a best fit. This is not a perfect solution. Different words have different weights when combined together. Adjectives and nouns combined together possibly would provide a better fit than say two nouns.
* Ex: 1-800-CAT-BIRD is probably less valuable than 1-800-BIG-BIRD

Also, theres a case of where proper nouns or acronyms would likely be way more valuable than words like prepositions or contractions if you were to add those to the dictionary too. 
* Ex: 1-800-AMC-HELP is probably more valuable than 1-800-BOB-HELP

Caching is not implemented either. Data could be either retrieved from dynamo or redis or for instance if the lambda is still warm, returned from it's own memory, and not do excessive db writes. The in-memory cache could be implemented like: 
``` javascript
//cache
let number; // above function, previous run of lambda would still have this value stored
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

# Instructions for installation on AWS

This guide assumes that the user has an AWS account and has downloaded the cli

### AWS Cloudformation installation

1.  Download Git repo `git clone [https://github.com/tpwidman/connect-challenge](https://github.com/tpwidman/connect-challenge)`
2.  Change directories into newly downloaded repository `cd connect-challenge`
3.  Change directories into the `cd connect-challenge-service folder`
4.  Using terminal run: `npm install --production` to download dependencies
5.  Change directories back to the cd connect-challenge
6.  If making a new bucket, use this: `aws s3 mb s3://connectchallenge022121`
7.  Run the following AWS command to upload the project to S3, replacing the --s3-bucket with an existing s3 bucket name in the same account. ([More information on the this step](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-cli-package.html))
    ```
	aws cloudformation package \
        --template cf-template-package.json \
        --s3-bucket connectchallenge022121 \
        --use-json \
        --output-template-file cf-template-deploy.json
    ```
8.  After running this, run the deploy command as below, either substituting a --stack-name or allowing AWS to create a new one called ConnectChallengeStack
    ```
	aws cloudformation deploy \
    --template-file cf-template-deploy.json \
    --stack-name ConnectChallengeStack \
    --capabilities CAPABILITY_IAM
	```
9.  Optionally test the function using this:

    ```
	aws lambda invoke \
    --function-name ConnectChallengeService \
    --payload "$(cat ./connect-challenge-service/tests/sample-connect-event.json | base64)" response.json
	```
10.  There should be a new file response.json with the response from the lambda as well as a new database record in the newly created DynamoDB table
    

### Amazon Connect Installation

1.  Navigate to the Amazon Connect console
2.  Click "Add an Instance"
3.  Choose "Store Users within Amazon Connect", add unique instance access url
4.  Proceed through the installation (I just used all the default options and created an admin role), and Create Instance
5.  For now, stay in the Amazon Connect console and click on the newly created Instance Alias
6.  Select "Contact Flows" and scroll down to AWS Lambda
7.  Select "ContactChallengeService" and click "+Add Lambda Function", this will allow the contact flows to use the new Lambda service.
8.  Navigate back to your Amazon Connect instance and click on the Access URL
9.  Login using your admin role credentials, note that it’s different from the AWS console credentials
10.  On the left side of the page and under the "Routing" menu item, click "Contact flows"
11.  Click "Create contact flow"
12.  On the right side of the page and above the contact flow diagram, click the dropdown and select "Import flow (beta)"
13.  An example flow has been added to the git repository called "VanityNumbersChallenge.json", upload that here and hit "Create"
14.  Click on the "Invoke AWS Lambda function" contact block and select the dropdown and click the newly associated Lambda function "ConnectContactService"
15.  Click "Save", then click "Publish"
16.  Return to the Dashboard
17.  Click on "Claim a phone number" and enter country and select a number
18.  Click on the dropdown "Contact flow / IVR"
19.  Select the newly created contact flow "VanityNumbersChallenge"
20.  Call the phone number and it should run the contact flow and new service

### Architecture diagram
![architecture-diagram](https://github.com/tpwidman/connect-challenge/blob/main/Connect%20flow%20diagram.png)

### Unit tests
To generate a coverage report for the unit tests, run `npm run coverage` after installing all dependencies including dev dependencies. Coverage at 100% 😃
