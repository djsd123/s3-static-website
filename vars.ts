import * as pulumi from "@pulumi/pulumi";

export { stackConfig, config, ttl };

const stackConfig = new pulumi.Config("s3-static-website");
const config = {
    domain: stackConfig.require("domain"),
    pathToWebsiteContents: stackConfig.require("pathToWebsiteContents"),
    certificateArn: stackConfig.get("certificateArn")
};

const ttl = 60 * 10; // Ten Minutes
