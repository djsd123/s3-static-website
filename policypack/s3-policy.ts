import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import {
    PolicyResource,
    ReportViolation,
    StackValidationArgs,
    StackValidationPolicy
} from '@pulumi/policy'

export { s3stackPolicy, s3PublicAccessBlockPolicy }

const stackConfig = new pulumi.Config('s3-static-website')
const config = {
    domain: stackConfig.require('domain')
}

const s3stackPolicy: StackValidationPolicy = {
    name: 's3-static-website-s3',
    description: 'S3 integration tests and policies for the s3-static-websites',
    enforcementLevel: 'mandatory',
    validateStack: async (args: StackValidationArgs, reportViolation: ReportViolation) => {

        const s3Buckets: PolicyResource[] = args.resources.filter(resource => resource.isType(aws.s3.Bucket))
        if (s3Buckets.length !== 2) {
            reportViolation(`Expected two s3 buckets in this stack but found ${s3Buckets.length}`)
            return
        }

        const mainBucket: PolicyResource | undefined = s3Buckets.find(s3Bucket => {
            return s3Bucket.props.bucket === config.domain
        })
        if (mainBucket?.props.acl === 'public-read-write' || mainBucket?.props.acl === 'public-read') {
            reportViolation(
                'You cannot set public-read or public-read-write on the website bucket. ' +
                'Read more about ACLs here: https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html'
            )
            return
        }

        const logsBucket: PolicyResource | undefined = s3Buckets.find(s3Bucket => {
            return s3Bucket.props.bucket === `${config.domain}-logs`
        })
        if (logsBucket?.props.acl === 'public-read-write' || logsBucket?.props.acl === 'public-read') {
            reportViolation(
                'You cannot set public-read or public-read-write on the logging bucket. ' +
                'Read more about ACLs here: https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html'
            )
            return
        }
    }
}

const s3PublicAccessBlockPolicy: StackValidationPolicy = {
    name: 's3-static-website-public-access-block',
    description: 'S3 public access block integration and policy verification',
    enforcementLevel: 'mandatory',
    validateStack: async (args: StackValidationArgs, reportViolation: ReportViolation) => {

        const s3PublicAccessBlockObjects: PolicyResource[] = args.resources.filter(resource => {
            return resource.isType(aws.s3.BucketPublicAccessBlock)
        })
        if (s3PublicAccessBlockObjects.length !== 1) {
            reportViolation(`Expected one BucketPublicAccessBlock object. 
            Got ${s3PublicAccessBlockObjects.length}`)
        }

        const s3PublicAccessBlockObject: string | any = s3PublicAccessBlockObjects[0].props

        if (s3PublicAccessBlockObject.bucket !== config.domain) {
            reportViolation(`Expected the target bucket to be ${config.domain}. 
            Got ${s3PublicAccessBlockObject.bucket}`)
        }

        if (s3PublicAccessBlockObject.blockPublicAcls === false ||
            s3PublicAccessBlockObject.blockPublicPolicy === false ||
            s3PublicAccessBlockObject.ignorePublicAcls === false ||
            s3PublicAccessBlockObject.restrictPublicBuckets === false) {
            reportViolation(`Public access to bucket: ${config.domain} is prohibited. \nResults: 
            blockPublicAcls       = ${s3PublicAccessBlockObject.blockPublicAcls}
            blockPublicPolicy     = ${s3PublicAccessBlockObject.blockPublicPolicy}
            ignorePublicAcls      = ${s3PublicAccessBlockObject.ignorePublicAcls}
            restrictPublicBuckets = ${s3PublicAccessBlockObject.restrictPublicBuckets}`)
        }
    }
}
