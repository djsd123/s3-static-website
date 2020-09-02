import { PolicyPack } from '@pulumi/policy'

import { cloudFrontStackPolicy } from './cloudfront-policies'
import { s3PublicAccessBlockPolicy, s3stackPolicy } from './s3-policy'

new PolicyPack('s3-static-website-stack', {
    policies: [
        cloudFrontStackPolicy,
        s3PublicAccessBlockPolicy,
        s3stackPolicy
    ]
})
