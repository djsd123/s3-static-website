import * as aws from '@pulumi/aws'
import {
    PolicyResource,
    ReportViolation,
    StackValidationArgs,
    StackValidationPolicy
} from '@pulumi/policy'
import {mainBucket} from "../s3";
import { Input } from '@pulumi/pulumi'

export const cloudFrontStackPolicy: StackValidationPolicy = {
    name: 's3-static-website-cloudfront',
    description: 'CloudFront integration tests and policies for s3-static-website \n',
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
        const Unrecommended_Protocols: Array<String> = ['TLSv1.1', 'TLSv1', 'SSLv3']

        distribution.origins.forEach(origin => {
            if (origin.customOriginConfig?.originSslProtocols.some(supersededTlsVersion => {
                return Unrecommended_Protocols.includes(supersededTlsVersion)
            })) {
                reportViolation(
                    `Protocols; ${Unrecommended_Protocols.toString()} are considered insecure and are not ` +
                    `allowed in this distribution (${origin.originId})`
                )
            }
        })

        function UneededMethods(methods: string): boolean {
            return ['PUT', 'POST', 'PATCH', 'DELETE'].includes(methods)
        }

        const defaultCacheBehaviour = distribution.defaultCacheBehavior

        if (defaultCacheBehaviour.allowedMethods.some(UneededMethods) ||
            defaultCacheBehaviour.cachedMethods.some(UneededMethods)
        ) {
            reportViolation(
                'The default cache behaviours allowedMethods and cachedMethods can only contain ' +
                'the following methods: GET, HEAD, OPTIONS. Found: \n' +
                `${defaultCacheBehaviour.allowedMethods} configured for allowedMethods \n` +
                'and \n' +
                `${defaultCacheBehaviour.cachedMethods} configured for cachedMethods`
            )
        }

        const stackProtocolPolicy: string = 'redirect-to-https'

        if (defaultCacheBehaviour.viewerProtocolPolicy !== stackProtocolPolicy) {
            reportViolation(
                `Expected Viewer Protocol Policy: \"${stackProtocolPolicy}\", ` +
                `Found: \"${defaultCacheBehaviour.viewerProtocolPolicy}\"`
            )
        }
    }
}
