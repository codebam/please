#!/home/codebam/.nvm/versions/node/v20.8.0/bin/node
import { spawnSync } from "child_process";

const API_TOKEN = process.env._CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env._CLOUDFLARE_ACCOUNT_ID;

const llama2 = async (prompt) => {
	const res = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-2-7b-chat-int8`,
		{
			headers: { Authorization: `Bearer ${API_TOKEN}` },
			body: JSON.stringify({
				messages: [
					{
						role: "system",
						content:
							"please respond only with commands to run; no english please",
					},
					{ role: "user", content: prompt },
				],
			}),
			method: "POST",
		}
	);
	const result = (await res.json()).result.response;
	return result;
};

const find_commands = (input) =>
	input
		.split("\n")
		.map((line) =>
			line
				.split("`")
				.join("")
				.replace(/^!/, "")
				.replace(/^\$/, "")
				.replace(/^ /, "")
		);

if (process.argv[2]) {
	const line = process.argv.slice(2).join(" ");
	console.log(line);
	const response = await llama2(line);
	console.log(response);
	find_commands(response).map((line) => {
		console.log(line);
		try {
			const { stdout, stderr } = spawnSync(line, { shell: true });
			console.log(stderr.toString());
			console.log(stdout.toString());
		} catch (e) {
			console.log(e);
		}
	});
}
