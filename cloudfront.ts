import * as aws from "@pulumi/aws";

import { mainBucket, logBucket } from "./s3";
import { Utils } from "./utils";
import * as vars from "./vars";

export { cdn };

const domainParts = Utils.getDomainAndSubDomain(vars.config.domain);

// Create Origin Access Identity
const oai = new aws.cloudfront.OriginAccessIdentity('origin-access-identity', {
    comment: 'Ensure visitors cannot access the site using the S3 endpoint url'
})

const originAccessIdentityPolicyStatement: aws.iam.PolicyStatement[] = [{
    Sid: 'originAccess',
    Action: ['s3:GetObject'],
    Effect: 'Allow',

    Principal: {
        AWS: oai.s3CanonicalUserId
    },

    Resource: `${mainBucket.arn}/*`
}]

const originAccessIdentityPolicy: aws.iam.PolicyDocument = {
    Version: '2012-10-17',
    Id: 'mainBucket',
    Statement: originAccessIdentityPolicyStatement
}

const originAccessIdentityPolicyAttachment = new aws.s3.BucketPolicy('originPolicyAttachment', {
    bucket: mainBucket.id,
    policy: originAccessIdentityPolicy,
})

// Cloudfront distribution args
const cloudFrontDistributionArgs: aws.cloudfront.DistributionArgs = {

    enabled: true,
    aliases: [vars.config.domain],
    origins: [
        {
            originId: mainBucket.arn,
            domainName: mainBucket.websiteEndpoint,
            s3OriginConfig: {
                originAccessIdentity: oai.cloudfrontAccessIdentityPath
            },
            customOriginConfig: {
                // Amazon S3 doesn't support HTTPS connections when using an S3 bucket configured as a website endpoint.
                // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesOriginProtocolPolicy
                originProtocolPolicy: "http-only",
                httpPort: 80,
                httpsPort: 443,
                originSslProtocols: ["TLSv1.2"],
            },
        },
    ],
    defaultRootObject: "index.html",

    // A CloudFront distribution can configure different cache behaviors based on the request path.
    // Here we just specify a single, default cache behavior which is just read-only requests to S3.
    defaultCacheBehavior: {
        targetOriginId: mainBucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],

        forwardedValues: {
            cookies: { forward: "none" },
            queryString: false,
        },

        compress: true,
        minTtl: 0,
        defaultTtl: vars.ttl,
        maxTtl: vars.ttl,
    },

    // "All" is the most broad distribution, and also the most expensive.
    // "100" is the least broad (USA, Canada and Europe), and also the least expensive.
    priceClass: "PriceClass_100",

    // You can customize error responses. When CloudFront recieves an error from the origin (e.g. S3 or some other
    // web service) it can return a different error code, and return the response for a different resource.
    customErrorResponses: [
        {
            errorCode: 404,
            responseCode: 404,
            responsePagePath: "/404.html",
        },
    ],

    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },

    viewerCertificate: {
        acmCertificateArn: vars.config.certificateArn,
        sslSupportMethod: "sni-only",
    },

    loggingConfig: {
        bucket: logBucket.bucketDomainName,
        includeCookies: false,
        prefix: `${vars.config.domain}/`,
    },
};

// Create the Cloudfront distribution
const cdn = new aws.cloudfront.Distribution("cdn", cloudFrontDistributionArgs);
