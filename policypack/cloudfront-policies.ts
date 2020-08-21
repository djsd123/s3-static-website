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
const Unrecommended_Protocols: Array<String> = ['TLSv1.1', 'TLSv1', 'SSLv3']

export const cloudFrontStackPolicy: StackValidationPolicy = {
    name: 's3-static-website-cloudfront',
    description: 'CloudFront integration tests and policies for the s3-static-websites',
    enforcementLevel: 'mandatory',
    validateStack: async (args: StackValidationArgs, reportViolation: ReportViolation) => {

        const distributions: PolicyResource[] = args.resources.filter(resource => {
            return resource.isType(aws.cloudfront.Distribution)
        })
        if (distributions.length !== 1) {
            reportViolation(
                `Expected one CloudFront Distribution in this stack but found ${distributions.length}`
            )
            return
        }

        const distribution = distributions[0].asType(aws.cloudfront.Distribution)!
        console.log(distribution.origins[0].customOriginConfig)
        distribution.origins.forEach(origin => {
            if (origin.customOriginConfig?.originSslProtocols.some(version => {
                return Unrecommended_Protocols.includes(version)
            })) {
                reportViolation(
                    `Protocols; ${Unrecommended_Protocols.toString()} are considered unsecure and are not ` +
                    `allowed in this distribution (${origin.originId})`
                )
                return
            }
        })
    }
}
