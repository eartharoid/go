// redirect to the long URL

const config = require('../config.json');

const { getClientIp } = require('@supercharge/request-ip');
const fetch = require('node-fetch');

const firebase = require('firebase-admin');
const { FieldValue } = firebase.firestore;
const serviceAccount = require('../firebase.json');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount)
});

const db = firebase.firestore();
const links = db.collection('urls');

module.exports = async (req, res) => {
	const { id } = req.query;

	if (!id) {
		return res.redirect(307, '/');
	}

	const urlRef = links.doc(id);
	const doc = await urlRef.get();

	if (!doc.exists) {
		return res.redirect(307, '/');
	}

	let clicksData = {
		time: new Date()
	};

	let referer = req.headers.referer;
	if (referer) {
		clicksData.referer = referer;
	}

	const IP = getClientIp(req);
	if (IP && config.collect.length > 1 && process.env.IPDATA_KEY) {
		let apiURL = `https://api.ipdata.co/${IP}?api-key=${process.env.IPDATA_KEY}&fields=${config.collect}`;
		let data = await (await fetch(apiURL)).json();

		if (!data.message) {
			for (let field in data) {
				clicksData[field] = data[field];
			}
		}
	}

	urlRef.update({
		clicks: FieldValue.arrayUnion(clicksData)
	});

	console.log(`Redirecting ${IP} to ${id}`);

	const { url } = doc.data();
	res.redirect(308, url);
};