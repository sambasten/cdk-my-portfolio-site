import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { S3BucketOrigin} from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';


export class CdkMyPortfolioSiteStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //Github Identity provider added n console

        //Create IAM role for Github identity provider in this repo
        const githubIdentityProviderRole = new iam.Role(this, 'GithubIdentityProviderRole', {
            assumedBy: new iam.WebIdentityPrincipal('arn:aws:iam::045283898962:oidc-provider/token.actions.githubusercontent.com',
                {
                    StringEquals: {
                        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                    },
                    StringLike: {
                        'token.actions.githubusercontent.com:sub': 'repo:sambasten/cdk-my-portfolio-site:*'
                    }
                }
            ),
            roleName: 'GithubIdentityProviderRole',
            description: 'Role for Github identity provider',
            inlinePolicies: {
                'GithubIdentityProviderPolicy': new iam.PolicyDocument({
                    statements: [
                        //deploy-stack job
                        new iam.PolicyStatement({
                            actions: ['sts:AssumeRole'],
                            resources: ['arn:aws:iam::045283898962:role/cdk-*'],
                        }),
                        //deploy-s3 job
                        new iam.PolicyStatement({
                            actions: ['sts:ListBucket'],
                            resources: ['arn:aws:s3:::akinwumisamuel.com'],
                        }),
                        new iam.PolicyStatement({
                            actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
                            resources: ['arn:aws:s3:::akinwumisamuel.com/*'],
                        })
                    ]
                })
            }
        });

        cdk.Tags.of(githubIdentityProviderRole).add('Name', 'GithubIdentityProviderRole');

        //S3
        const myBucket = new s3.Bucket(this, 'PortfolioBucket',{
            bucketName: 'akinwumisamuel.com',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        })

        cdk.Tags.of(myBucket).add('Name', 'Bucket for my portfolio site');


        //look up created route53 hz
        const myHostedZone = route53.PublicHostedZone.fromLookup(this, 'MyHostedZone', {
            domainName: 'akinwumisamuel.com'
        });
        cdk.Tags.of(myHostedZone).add('Name', 'MyHostedZone');

        // //create ACM SSL certificate
        const mycert = new acm.Certificate(this, 'myCertv2', {
            domainName: myHostedZone.zoneName,
            subjectAlternativeNames: ['*.akinwumisamuel.com'],//one level deep wildcard
            validation: acm.CertificateValidation.fromDns(myHostedZone)
        });

        cdk.Tags.of(mycert).add('Name', 'myCertv2');

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
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 404,
                    responsePagePath: '/error.html'
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 404,
                    responsePagePath: '/error.html'
                }
            ],
                defaultRootObject: 'index.html',
                certificate: mycert,
                domainNames: [
                    myHostedZone.zoneName, 'www.' + myHostedZone.zoneName,
                ]
            })

        cdk.Tags.of(cfDist).add('Name', 'CFDistribution for my portfoliosite');

        //add A record type to hosted zone and target cloudfront
        //root
        const aRecord = new route53.ARecord(this, 'Arecord akinwumisamuelCom', {
            zone: myHostedZone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cfDist))
        });

        const a4Record = new route53.AaaaRecord(this, 'A4record akinwumisamuelCom', {
            zone: myHostedZone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cfDist))
        });
        //www
        const wwwaRecord = new route53.ARecord(this, 'Arecord wwwakinwumisamuelCom', {
            recordName: 'www',
            zone: myHostedZone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cfDist))
        });

        const wwwa4Record = new route53.AaaaRecord(this, 'A4record wwwakinwumisamuelCom', {
            recordName: 'www',
            zone: myHostedZone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cfDist))
        });

        new cdk.CfnOutput(this, 'Domain name', {
            value: myHostedZone.zoneName //akinwumisamuel.com
        })
    }
}
