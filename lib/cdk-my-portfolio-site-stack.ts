import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { S3BucketOrigin} from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class CdkMyPortfolioSiteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //S3
        const myBucket = new s3.Bucket(this, 'PortfolioBucket',{
            bucketName: 'akinwumisamuel.com',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        })

        cdk.Tags.of(myBucket).add('Name', 'Bucket for my portfolio site');


        //look up created route53 hz
        const myHostedZone = route53.PublicHostedZone.fromLookup(this, 'MyHostedZone', {
            domainName: 'akinwumisamuel.com'
        });

        // //create ACM SSL certificate
        const mycert = new acm.Certificate(this, 'myCertv2', {
            domainName: myHostedZone.zoneName,
            validation: acm.CertificateValidation.fromDns(myHostedZone)
        });

        //cloudfront distribution
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
                certificate: mycert,
                domainNames: [
                    myHostedZone.zoneName //akinwumisamuel.com 
                ]
            })

        cdk.Tags.of(cfDist).add('Name', 'CFDistribution my site');

        //add A record type to hosted zone and target cloudfront
        const aRecord = new route53.ARecord(this, 'ipv4 akinwumisamuelCom', {
            zone: myHostedZone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cfDist))
        });

        const aaaaRecord = new route53.AaaaRecord(this, 'ipv6 akinwumisamuelCom', {
            zone: myHostedZone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cfDist))
        });

        new cdk.CfnOutput(this, 'Domain name', {
            value: myHostedZone.zoneName //akinwumisamuel.com
        })
    }
}
