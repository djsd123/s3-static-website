# S3 Static Website

### Deploy a static https website hosted on s3 
Credit to example here https://github.com/pulumi/examples/blob/master/aws-ts-static-website/index.ts

#### Prerequisites

* [nodejs](https://nodejs.org/en/download/) or [yarn](https://classic.yarnpkg.com/en/docs/install)
* [pulumi](https://www.pulumi.com/docs/get-started/install/#install-pulumi)
* [typescript](https://www.typescriptlang.org/index.html#download-links)
* [ACM Certificate](https://github.com/djsd123/amazon-certificate-manager)

#### Usage

First create yourself a stack file named `Pulumi<CHOOSE STACK NAME>.yaml` with the following contents
```yaml
config:
  aws:region: eu-west-1
  aws:profile: <YOUR PROFILE NAME>
  s3-static-website:domain: <www.YOURDOMAIN>
  s3-static-website:pathToWebsiteContents: ./www
    description: Relative path to the website's contents (e.g. the `./www` folder)
  s3-static-website:certificateArn: arn:aws:acm:us-east-1:<YOUR CERTIFICATE ARN>
    description: (Optional) ACM certificate ARN for the target domain; must be in the us-east-1 region. If omitted, a certificate will be created.
```

```bash
yarn install or npm install
```

```bash
pulumi up
```

#### Outputs
* targetDomainEndpoint
* cloudFrontDomain
* mainBucketURI
* mainBucketWebsiteEndpoint