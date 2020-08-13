import React, { useState, useEffect } from "react";
import { usePromise } from "@cadbox1/use-promise";
import axios from "axios";

const localStorageKey = "token";

function App() {
	const [email, setEmail] = useState("");
	const [token, setToken] = useState(localStorage.getItem(localStorageKey));

	useEffect(() => {
		localStorage.setItem(localStorageKey, token || "");
	}, [token]);

	useEffect(() => {
		const parsedHash = new URLSearchParams(
			window.location.hash.substr(1) // skip the first char (#)
		);
		if (parsedHash && parsedHash.get("token")) {
			setToken(parsedHash.get("token"));
			window.location.hash = "";
		}
	}, [window.location.hash]);

	const homeRequest = usePromise({
		promiseFunction: async () => {
			const result = await axios.get("/api/home", {
				headers: {
					Authorization: "Bearer " + token,
				},
			});
			return result.data;
		},
	});
	useEffect(() => {
		if (token) {
			homeRequest.call();
		}
	}, [token]);

	const requestLink = usePromise({
		promiseFunction: async () => {
			const result = await axios.post("/api/sendLink", { email });
			return result;
		},
	});
	return (
		<div>
			<h1>Internal Auth App</h1>

			<div>
				{homeRequest.pending
					? "authenticating..."
					: homeRequest.rejected
					? "authentication failed"
					: homeRequest.fulfilled &&
					  homeRequest.value && (
							<div>
								<h2>Authenticated!</h2>
								{JSON.stringify(homeRequest.value)}
							</div>
					  )}
			</div>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					requestLink.call();
				}}
				style={{marginTop: "2rem"}}
			>
				<h2>Send Magic Link</h2>
				<input
					value={email}
					onChange={(event) => setEmail(event.target.value)}
				/>
				<button type="submit">
					{requestLink.pending ? "Sending Magic Link..." : "Send Magic Link"}
				</button>
				<div style={{ marginTop: "1rem" }}>
					{requestLink.pending
						? null
						: requestLink.rejected
						? "Error sending Magic Link"
						: requestLink.fulfilled && "Magic Link sent Successfully"}
				</div>
			</form>
		</div>
	);
}

export default App;
