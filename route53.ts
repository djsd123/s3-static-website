import * as aws from "@pulumi/aws";

import { cdn } from "./cloudfront";
import { Utils } from "./utils";
import * as vars from "./vars";

// Creates a new Route53 DNS record pointing the domain to the CloudFront distribution
function createAliasRecord(domainName: string, CloudFrontDistribution: aws.cloudfront.Distribution): aws.route53.Record {
    const domainParts = Utils.getDomainAndSubDomain(domainName);
    const hostedZoneId = aws.route53.getZone({
        name: domainParts.parentDomain,
    }, { async: true }).then(zone => zone.zoneId);

    return new aws.route53.Record(vars.config.domain, {
        name: domainParts.subDomain,
        zoneId: hostedZoneId,
        type: "A",
        aliases: [
            {
                name: CloudFrontDistribution.domainName,
                zoneId: CloudFrontDistribution.hostedZoneId,
                evaluateTargetHealth: true,
            },
        ],
    });
}

const aRecord = createAliasRecord(vars.config.domain, cdn);
