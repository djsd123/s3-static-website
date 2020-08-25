import { PolicyPack } from '@pulumi/policy'

import { cloudFrontStackPolicy } from './cloudfront-policies'
import { s3stackPolicy } from './s3-policy'

new PolicyPack('s3-static-website-stack', {
    policies: [
        s3stackPolicy,
        cloudFrontStackPolicy
    ]
})
