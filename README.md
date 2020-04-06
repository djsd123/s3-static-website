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
pulumi preview
```

```bash
pulumi up
```

#### GitHub Actions

You can also deploy by using [actions](https://github.com/features/actions).  The actions in this repo 
work when you create a __Pull Request__, then merge to master. You'll need to add the credentials mentioned below as secrets 
to your github repo

**Required**
* [AWS ACCESS ID and SECRET KEY](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
* [PULUMI ACCESS TOKEN](https://www.pulumi.com/docs/intro/console/accounts-and-organizations/accounts/#access-tokens)


#### Outputs
* targetDomainEndpoint
* cloudFrontDomain
* mainBucketURI
* mainBucketWebsiteEndpoint