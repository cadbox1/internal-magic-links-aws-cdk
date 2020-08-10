import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";

export class LambdaCdkStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const sendLinkLambda = new lambda.Function(this, "sendLinkFunction", {
			code: new lambda.AssetCode("src"),
			handler: "sendLink.handler",
			runtime: lambda.Runtime.NODEJS_12_X,
		});

		const api = new apigateway.RestApi(this, "authApi", {
			restApiName: "Auth Service",
		});

		const authResource = api.root.addResource("auth");

		const sendLinkIntegration = new apigateway.LambdaIntegration(
			sendLinkLambda
		);
		authResource.addMethod("POST", sendLinkIntegration);
	}
}
