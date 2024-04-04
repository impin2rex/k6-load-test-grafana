import http from 'k6/http';
import { sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const RPC_URL = 'YOUR_SOLANA_RPC_URL';

let responseTimes = new Trend('rpc_response_times');
let requestRate = new Rate('rpc_request_rate');

export let options = {
	stages: [
		{ duration: "1s", target: 50 }, // Ramp up to 50 VUs instantly
		{ duration: "1m", target: 100 }
	],
	thresholds: {
		http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1000ms
	},
};

export default function () {
	const signaturesRes = http.post(
		RPC_URL,
		JSON.stringify({
			jsonrpc: '2.0',
			id: 1,
			method: 'getSignaturesForAddress',
			params: ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', { limit: 100 }],
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
	responseTimes.add(signaturesRes.timings.duration, { method: 'getSignaturesForAddress' });
	requestRate.add(1, { method: 'getSignaturesForAddress' });

	const signatures = extractSignatures(JSON.parse(signaturesRes.body));

	const transactionPayloads = generateTransactionPayloads(signatures);

	// Send multiple requests concurrently
	const transactionResponses = http.batch(transactionPayloads.map(payload => ({
		method: 'POST',
		url: RPC_URL,
		body: payload,
		params: {
			headers: { 'Content-Type': 'application/json', },
		},
	})));

	transactionResponses.forEach(response => {
		responseTimes.add(response.timings.duration, { method: 'getTrasaction' });
		requestRate.add(1, { method: 'getTrasaction' });
	});

	const parsedTransactionResponses = transactionResponses.map((r) => JSON.parse(r.body));

	const ataAccountKeys = parsedTransactionResponses.map((r) => {
		const ataAccountIndexes = r.result.meta.postTokenBalances.map((x) => x.accountIndex)
		const ataAccountKey = ataAccountIndexes.map(index => r.result.transaction.message.accountKeys[index].pubkey);
		return ataAccountKey;
	});

	const allPubkeys = [].concat(...ataAccountKeys);

	const shuffledPubkeys = allPubkeys.sort(() => Math.random() - 0.5);

	const selectedPubkeys = shuffledPubkeys.slice(0, Math.floor(Math.random() * 41) + 10);

	console.log("selectedPubkeys", selectedPubkeys.length);

	const getAccountsResponse = http.batch(selectedPubkeys.map(pubkey => ({
		method: 'POST',
		url: RPC_URL,
		body: JSON.stringify(
			{
				"jsonrpc": "2.0",
				"id": 1,
				"method": "getAccountInfo",
				"params": [
					pubkey,
					{
						"encoding": "jsonParsed"
					}
				]
			}
		),
		params: {
			headers: { 'Content-Type': 'application/json', },
		},
	})));

	getAccountsResponse.forEach(response => {
		responseTimes.add(response.timings.duration, { method: 'getAccountInfo' });
		requestRate.add(1, { method: 'getAccountInfo' });
	});

	sleep(1);
}

function extractSignatures(responseBody) {
	return responseBody.result.map((r) => r.signature)
}

function generateTransactionPayloads(signatures) {
	return signatures.map((signature) => {
		return JSON.stringify({
			"jsonrpc": "2.0",
			"id": 1,
			"method": "getTransaction",
			"params": [
				signature,
				{
					"encoding": "jsonParsed",
					"maxSupportedTransactionVersion": 0
				}
			]
		});
	})
}