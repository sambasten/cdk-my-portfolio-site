import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin} from 'aws-cdk-lib/aws-cloudfront-origins';

export class CdkMyPortfolioSiteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        //cloufront and S3

        const myBucket = new s3.Bucket(this, 'PortfolioBucket',{
            bucketName: id == 'CdkMyPortfolioSiteStack' ? 'sambasten-portfolio-website' : undefined ,//avoids existing bucket name error for PR test stack
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        })

        cdk.Tags.of(myBucket).add('Name', 'Bucket for my portfolio site');

        const cfDist = new cloudfront.Distribution(this, 'CFDistribution', {
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(myBucket),
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                cachedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy:  new cloudfront.CachePolicy(this, 'CfCachePolicy', {
                                defaultTtl: cdk.Duration.seconds(120),
                                minTtl: cdk.Duration.seconds(0),
                                maxTtl: cdk.Duration.seconds(3600)
                }),
            },
                defaultRootObject: 'index.html',
                geoRestriction: cloudfront.GeoRestriction.allowlist('US', 'CA', 'GB', 'AU'),
            })

        cdk.Tags.of(cfDist).add('Name', 'CFDistribution my site');

        new cdk.CfnOutput(this, 'CFDistributionDomain', {
            value: cfDist.distributionDomainName
        })
    }
}
