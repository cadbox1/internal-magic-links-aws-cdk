import { APIGatewayProxyHandler } from "aws-lambda";
import { TokenData, secret } from "./common";
import { verify } from "jsonwebtoken";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
	const { headers } = event;
	const { Authorization } = headers;
	if (!Authorization || !Authorization.startsWith("Bearer ")) {
		return {
			statusCode: 403,
			body: JSON.stringify({
				validation: {
					field: "Authorization",
					message: "Authorization is required",
				},
			}),
		};
	}

	const token = Authorization.replace(/Bearer /g, "");
	let tokenData: TokenData;
	try {
		tokenData = verify(token, secret) as TokenData;
	} catch (error) {
		return {
			statusCode: 403,
			body: JSON.stringify({
				validation: {
					field: "Authorization",
					message: "Token not valid",
				},
			}),
		};
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			email: tokenData.email,
		}),
	};
};