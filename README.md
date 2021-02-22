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