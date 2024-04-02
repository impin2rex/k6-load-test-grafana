import http from 'k6/http';
import { check, sleep } from "k6";

const API_KEY = 'YOUR_API_KEY';
const API_BASE_URL = 'https://dev.shyft.to/sol/v1';

export let options = {
	stages: [
		{ duration: "1s", target: 100 }, // Ramp up to 100 VUs instantly
		{ duration: "1m", target: 150 }, // Ramp up to 150 VUs in 1 minute
		// { duration: "5m", target: 200 }, // Stay at 100 VUs for 5 minutes
	],
	thresholds: {
		http_req_duration: ["p(95)<5000"], // 95% of requests must complete within 5000ms
	},
};

export default function () {
	const mintRequestBody = JSON.stringify({
		network: "mainnet-beta",
		creator_wallet: "4Ky9xguUTCJcAqyrrA9Aeb8S16kpnvbz1zKNDyLL3M3d",
		metadata_uri: "http://kfz32zfun6rfyqgkbks2usmdsy3fzn3j4y7xgbw62q5kpcghpyya.arweave.net/UXO9ZLRvolxAygqlqkmDljZct2nmP3MG3tQ6p4jHfjA",
		merkle_tree: "Emu6DL7QzrgS72Lx9FfPt4oMSnJHAzegGDemBCH8q9Ru",
		is_delegate_authority: true,
		collection_address: "B2tfrT5t71PJrjniaeuqob9DZCKu7ubA4gRf2wYFB9AJ",
		max_supply: 1,
		primary_sale_happened: false,
		is_mutable: true,
		receiver: "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R",
		fee_payer: "rexYt592c6v2MZKtLTXmWQt9zdEDdd3pZzbwSatHBrx",
		service_charge: {
			token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
			receiver: "5KW2twHzRsAaiLeEx4zYNV35CV2hRrZGw7NYbwMfL4a2",
			amount: 0.01
		},
		"priority_fee": 1000
	});


	let res;
	const randomValue = Math.random();
	if (randomValue < 0.3743) {
		// 37.43% of the time, mintRes will be called
		res = http.post(`${API_BASE_URL}/nft/compressed/mint`, mintRequestBody, {
			headers: {
				'Content-Type': 'application/json',
				"x-api-key": API_KEY
			},
		});
		check(res, {
			"Mint status is 201": (r) => r.status === 201,
		});
	} else if (randomValue < 0.4853) {
		// 11.10% of the time, parsedTxnRes will be called
		res = http.get(`${API_BASE_URL}/transaction/parsed?network=mainnet-beta&txn_signature=61tUt187YNGTCDRXcfmV6hysfuLtNn6bSHkGXV6RrX3UhKsZc4VAymV4r961qufcyJhgwH8FAQM39J8Soczpck21`, {
			headers: {
				"x-api-key": API_KEY
			},
		});
		check(res, {
			"Parsed Txn status is 200": (r) => r.status === 200,
		});
	} else if (randomValue < 0.8596) {
		// 37.43% of the time, txnHistoryRes will be called
		res = http.get(`${API_BASE_URL}/transaction/history?network=mainnet-beta&account=675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8`, {
			headers: {
				"x-api-key": API_KEY
			},
		});
		check(res, {
			"Txn History status is 200": (r) => r.status === 200,
		});
	} else {
		// 13.63% of the time, tokenInfoRes will be called
		res = http.get(`${API_BASE_URL}/token/get_info?network=mainnet-beta&token_address=7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj`, {
			headers: {
				"x-api-key": API_KEY
			},
		});
		check(res, {
			"Token Info status is 200": (r) => r.status === 200,
		});
	}

	sleep(1);
}
