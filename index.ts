import * as cloudfront from"./cloudfront";
import * as pulumi from "@pulumi/pulumi";
import "./route53";
import * as s3 from "./s3";
import * as vars from "./vars";

// Export properties from this stack. This prints them at the end of `pulumi up` and
// makes them easier to access from the pulumi.com console.
export const targetDomainEndpoint = `https://${vars.config.domain}/`;
export const cloudFrontDomain = cloudfront.cdn.domainName;
export const mainBucketURI = pulumi.interpolate `s3://${s3.mainBucket.bucket}`;
export const mainBucketWebsiteEndpoint = s3.mainBucket.websiteEndpoint;
export const cdnUrn = cloudfront.cdn.urn
