import { APIGatewayProxyHandler } from "aws-lambda";


const allowedDomain = process.env.ALLOWED_DOMAIN || "cadell.dev";

interface SendBody {
	email: string;
}

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    // @ts-ignore
	const data: SendBody = JSON.parse(event.body);
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

	// const tokenData: TokenData = {
	// 	email,
	// };

	// const token = jwt.sign(tokenData, secret, { expiresIn: "1h" });
    // 
	// const params: SES.Types.SendEmailRequest = {
	// 	Destination: {
	// 		ToAddresses: [email],
	// 	},
	// 	Message: {
	// 		Subject: {
	// 			Data: "Magic link for internal auth service",
	// 		},
	// 		Body: {
	// 			Html: {
	// 				Data: `Token: ${token}`,
	// 			},
	// 			Text: {
	// 				Data: `Token: ${token}`,
	// 			},
	// 		},
	// 	},
	// 	Source: "hello@cadell.dev",
	// };

	try {
		// await ses.sendEmail(params).promise();
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