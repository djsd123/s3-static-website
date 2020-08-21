import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import {
    PolicyResource,
    ReportViolation,
    StackValidationArgs,
    StackValidationPolicy
} from '@pulumi/policy'

const stackConfig = new pulumi.Config('s3-static-website')
const config = {
    domain: stackConfig.require('domain')
}

export const s3stackPolicy: StackValidationPolicy = {
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
        if (mainBucket?.props.acl === 'public-read-write') {
            reportViolation(
                'You cannot set public-read-write on the website bucket. ' +
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
