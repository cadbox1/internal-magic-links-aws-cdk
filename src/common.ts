export const secret = process.env.SECRET || "secret";

export interface TokenData {
	email: string;
}