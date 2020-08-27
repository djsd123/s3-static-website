import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import * as vars from "./vars";

export { mainBucket, logBucket };

const mainBucket = new aws.s3.Bucket("mainBucket",{
    bucket: vars.config.domain,
    acl: "private",
    website: {
        indexDocument: "index.html",
        errorDocument: "404.html",
    }
});

import * as fs from "fs";
import * as mime from "mime";
import * as path from "path";

// crawlDirectory recursive crawls the provided directory, applying the provided function
// to every file it contains. Doesn't handle cycles from symlinks.
function crawlContentDirirecotry(path: string, f: (_: string) => void) {
    const files = fs.readdirSync(path);
    for (const file of files) {
        const filepath = `${path}/${file}`;
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            crawlContentDirirecotry(filepath, f);
        }
        if (stat.isFile()) {
            f(filepath);
        }
    }
}

// Sync the contents of the source directory with the S3 bucket, which will in-turn show up on the CDN
const webContentsRootPath = path.join(process.cwd(), vars.config.pathToWebsiteContents);
console.log("Syncing contents from local disk at", webContentsRootPath);
crawlContentDirirecotry(webContentsRootPath, (filePath: string) => {
    const relativeFilePath = filePath.replace(webContentsRootPath + "/", "");
    const contentFile = new aws.s3.BucketObject(relativeFilePath, {
        key: relativeFilePath,
        acl: "public-read",
        bucket: mainBucket,
        contentType: mime.getType(filePath) || undefined,
        source: new pulumi.asset.FileAsset(filePath),
    }, {
        parent: mainBucket,
    });
});


// Export the name of the bucket
export const bucketName = mainBucket.id;

// logsBucket is an S3 bucket that will contain the CDN's request logs.
const logBucket = new aws.s3.Bucket("requestLogs", {
    bucket: `${vars.config.domain}-logs`,
    acl: "private",
});
