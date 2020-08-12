import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { PolicyStatement } from "@aws-cdk/aws-iam";

export class LambdaCdkStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const api = new apigateway.RestApi(this, "authApi", {
			restApiName: "Auth Service",
		});

		// sendLink lambda
		const sendLinkLambda = new lambda.NodejsFunction(this, "sendLinkFunction", {
			entry: "src/sendLink.ts",
			handler: "handler",
		});

		const sendEmailPolicy = new PolicyStatement({
			actions: ["ses:SendEmail", "ses:SendRawEmail"],
        	resources: ["*"],
		});
		sendLinkLambda.addToRolePolicy(sendEmailPolicy);

		const sendLinkResource = api.root.addResource("sendLink");
		const sendLinkIntegration = new apigateway.LambdaIntegration(
			sendLinkLambda
		);
		sendLinkResource.addMethod("POST", sendLinkIntegration);

		// home lambda
		const homeLambda = new lambda.NodejsFunction(this, "homeFunction", {
			entry: "src/home.ts",
			handler: "handler",
		});

		const homeResource = api.root.addResource("home");
		const homeIntegration = new apigateway.LambdaIntegration(
			homeLambda
		);
		homeResource.addMethod("GET", homeIntegration);
	}
}
