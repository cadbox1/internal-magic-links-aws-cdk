import { SES } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";
import { sign } from "jsonwebtoken";
import { secret, TokenData } from "./common";

const ses = new SES();

const allowedDomain = process.env.ALLOWED_DOMAIN || "cadell.dev";

interface SendLinkBody {
	email: string;
}

export const handler: APIGatewayProxyHandler = async (event, _context) => {
	// @ts-ignore
	const data: SendLinkBody = JSON.parse(event.body);
	const { email } = data;
	if (!email) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				validation: {
					field: "email",
					message: "Email is required",
				},
			}),
		};
	}

	if (!email.endsWith("@" + allowedDomain)) {
		return {
			statusCode: 403,
			body: JSON.stringify({
				validation: {
					field: "email",
					message: "Email address is not allowed",
				},
			}),
		};
	}

	const tokenData: TokenData = {
		email,
	};

	const token = sign(tokenData, secret, { expiresIn: "1h" });

	const baseUrl = "https://djsker0ak13tr.cloudfront.net";
	const href = baseUrl + "/#?token=" + token;

	const params: SES.Types.SendEmailRequest = {
		Destination: {
			ToAddresses: [email],
		},
		Message: {
			Subject: {
				Data: "Magic link for internal auth service",
			},
			Body: {
				Html: {
					Data: `<a href="${href}" target="_blank">Authenticate me</a>`,
				},
				Text: {
					Data: `Login url: ${href}`,
				},
			},
		},
		Source: "hello@cadell.dev",
	};

	try {
		await ses.sendEmail(params).promise();
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "email sent succesfully",
			}),
		};
	} catch (error) {
		console.error(error, error.stack);
		return {
			statusCode: 503,
			body: JSON.stringify({
				message: "something went wrong :(",
			}),
		};
	}
};
