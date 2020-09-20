import * as aws from '@pulumi/aws'

export { s3StaticWebsiteACL, s3StaticWebsiteWAFRuleGroup }

const provider = new aws.Provider('provider-us-east-1', {
    region: 'us-east-1'
})

const s3StaticWebsiteWAFRuleGroup = new aws.wafv2.RuleGroup('s3-static-website-rules', {
    description: 'AWS WAF rules for an s3 static website',
    scope: 'CLOUDFRONT',
    capacity: 50,
    rules: [
        {
            name: 'disallowed-locations',
            priority: 1,
            action: {
                block: {}
            },
            statement: {
                geoMatchStatement: {
                    countryCodes: [
                        'CN',
                        'RU'
                    ]
                }
            },
            visibilityConfig: {
                cloudwatchMetricsEnabled: true,
                metricName: 'disallowed-locations',
                sampledRequestsEnabled: true
            }
        },
        {
            name: 'count-http-methods',
            priority: 2,

            action: {
                count: {}
            },

            statement: {
                xssMatchStatement: {
                    fieldToMatch: {
                        method: {}
                    },
                    textTransformations: [{
                        priority: 2,
                        type: 'NONE',
                    }]
                }
            },

            visibilityConfig: {
                cloudwatchMetricsEnabled: true,
                metricName: 'count-http-methods',
                sampledRequestsEnabled: true
            }
        }
    ],

    visibilityConfig: {
        cloudwatchMetricsEnabled: true,
        metricName: 's3-static-website-rules',
        sampledRequestsEnabled: true
    }
}, { provider })

const s3StaticWebsiteACL = new aws.wafv2.WebAcl('s3-static-website-acl', {
    description: 'AWS WAF rules for an s3 static website',
    scope: 'CLOUDFRONT',

    defaultAction: {
        allow: {}
    },

    rules: [
        {
            name: 'AWS-AWSManagedRulesCommonRuleSet',
            priority: 0,

            overrideAction: {
                count: {}
            },

            statement: {
                managedRuleGroupStatement: {
                    name: 'AWSManagedRulesCommonRuleSet',
                    vendorName: 'AWS'
                }
            },

            visibilityConfig: {
                cloudwatchMetricsEnabled: true,
                metricName: 'AWSManagedRulesCommonRuleSet',
                sampledRequestsEnabled: true
            }
        },
        {
            name: 'AWS-AWSManagedRulesAnonymousIpList',
            priority: 1,

            overrideAction: {
                count: {}
            },

            statement: {
                managedRuleGroupStatement: {
                    name: 'AWSManagedRulesAnonymousIpList',
                    vendorName: 'AWS'
                }
            },

            visibilityConfig: {
                cloudwatchMetricsEnabled: true,
                metricName: 'AWS-AWSManagedRulesAnonymousIpList',
                sampledRequestsEnabled: true
            }
        },
        {
            name: 'AWS-AWSManagedRulesAmazonIpReputationList',
            priority: 2,

            overrideAction: {
                count: {}
            },

            statement: {
                managedRuleGroupStatement: {
                    name: 'AWSManagedRulesAmazonIpReputationList',
                    vendorName: 'AWS'
                }
            },

            visibilityConfig: {
                cloudwatchMetricsEnabled: true,
                metricName: 'AWS-AWSManagedRulesAmazonIpReputationList',
                sampledRequestsEnabled: true
            }
        },
        {
            name: 's3-static-website-acl',
            priority: 3,

            overrideAction: {
                count: {}
            },

            statement: {
                ruleGroupReferenceStatement: {
                    arn: s3StaticWebsiteWAFRuleGroup.arn
                }
            },

            visibilityConfig: {
                cloudwatchMetricsEnabled: false,
                metricName: 's3-static-website-acl',
                sampledRequestsEnabled: false
            }
        },
    ],

    visibilityConfig: {
        cloudwatchMetricsEnabled: true,
        metricName: 's3-static-website-acl',
        sampledRequestsEnabled: true
    }
}, { provider })
