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

### Prompt Responses
1. Record your reasons for implementing the solution the way you did, struggles you faced and problems you overcame.
> I started with the initial lambda service written using Node as I knew that would be a comfortable start, and I also knew that had the most creative control decisions that needed to be made. 
> 
> I made a function that would take in numbers and spit out combinations of possible words and they were mostly not words ([found a tutorial from a Google interview question](https://www.youtube.com/watch?v=21OuwqIC56E) and followed that as a guide). Then, I looked around for a dictionary of words and found one sorted alphabetically. I realized I had to select a new dictionary where the words were already sorted. I removed all the words in that dictionary that were greater than 7 letters long. After that, I completed my unit tests and realized that it was mostly returning single words. I knew that I needed to go back and add multiple short word combinations. It was just a process of trial and error until I was prepared to test the project on AWS.
> 
> Then, I knew I would need to integrate the new Lambda with Amazon Connect. I had never used that before, but had used API Gateway REST Proxy Integrations before and knew that, with all things Amazon, the process would be familiar. I found a sample event json file and knew that the requests to my service would look like this and was able to immediately start writing unit tests along side my function.The contact flow was easy to setup, but the claimed phone number doesn't always work. I mostly test ran the service in the Lambda console instead of calling in.
> 
> The decision to go with CloudFormation was because I wanted to learn something new. I had already used SAM along with Docker and knew that it was past time that I learned CloudFormation. I found that it was pretty easy to use and learned that YAML is much easier to read than JSON. I got stuck for like 45 minutes on the inline policy document for the Lambda service because there was a typo in the policy. "Fn::GetAtt" not "Fn:GetAtt"
> 
> It was really fun to learn to set up all these things manually and build out a template that does the work for you. I had always used these resources already configured. In my current job, my role is so Lambda focused. I have built out other service combinations many times, but never assembled it all from scratch.
> 
> The decision to go with S3 for the hosting of the site was because of convenience. I could go select a `t2.micro` instance and install an AMI and install an Express server, and assign the relevant permissions to reach DynamoDB, and make a service to return the 5 values. Instead, I just set my bucket policy to host a free static site. Then, I added small lambda that returns a list of json data from my DB as an API Gateway service and exposed the endpoints. In my index.html file of my site, I just referenced the url of the API Gateway link as my data provider for my table.
2. What shortcuts did you take that would be a bad practice in production?
> I addressed some of this in the [README.md](https://github.com/tpwidman/connect-challenge/tree/main/connect-challenge-service) file of the Lambda service. I would have also liked to implement a cache for returning the same values for the same phone number. In production, we would likely want to have the web application behind some security and authorization and definitely on something bigger. We could also implement some load balancing and/or autoscale groups. The Lambda service looks very similar to some of the ones that we have in production. There is not any authorizer or API key used the request to retrieve the data, and that would be a big problem in production. We could implement our own authorizer using a redis cache.
>
>We could possibly implement an SES email strategy for error handling if the Lambda errors, or publish to an SQS queue with details of the failure. We also could have stored the table name for DynamoDB in a AWS KMS key if the value of the table name cannot be stored in plaintext in the deployment configuration file. The Lambda references the table name from environment variables. We could take these from the key value store instead. 
>
>We could also implement some CI/CD for building these projects and ensure that unit test coverage reaches a set level of coverage to ensure the developers are testing new features that are added. I didn't implement any Git hooks for building a package and that would make the deployment process easier. Also, the contact flow is very simple. I'm imagining that verbiage would need to be approved as well as more interaction with the client. Also, there is not any staging environment. It would be nice to have a QA to test things before deploying to production.
>
>At the very end of the project, I had made a service that returns latest 5 from DynamoDB. But it was not returning them in order. I did some research and found that I had set it up incorrectly. I had stored the key createdAt as a Date ISO string and as a HASH. I realized that I was basically using the field wrong. I updated this hash to be a unique id using the uuid package. Then, I added the createdAt field as a number and updated my little lambda service. In production, I would probably recommend that we use a totally different DB. The little lambda service is doing all the sorting. It's a small table, but is likely to grow in production. Truthfully, I like Mongo better than DynamoDB.
3. What would you have done with more time? We know you have a life. :-)
> If I'm answering what I would have done with my weekend, I would have probably done some cleaning around the house or cooked a new recipe. It was too cold to go out, but I really need some fresh air and would've gone hiking.
>
>If I'm using more time to work on the project, I would've implemented response caching with Elasticache, setup Githooks with my project to my S3 buckets, implemented some security on API Gateway, implemented a Git commit hook for updating site files and service, and improved my dictionary of terms by removing some values that aren't great combinations of words.

### Architecture diagram
![architecture-diagram](https://github.com/tpwidman/connect-challenge/blob/main/Connect%20flow%20diagram.png)

### Connect Challenge Static Site
http://connect-table-static.s3-website-us-east-1.amazonaws.com/

### Amazon Connect Claimed Phone Number
+1 213-776-4490