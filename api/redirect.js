// redirect to the long URL

const config = require('../config.json');
const { regex } = require('../globals.js');
const { hash } = require('../functions.js');
const { getClientIp } = require('@supercharge/request-ip');
const fetch = require('node-fetch');

const firebase = require('firebase-admin');
const { FieldValue } = firebase.firestore;


firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
});

const db = firebase.firestore();
const links = db.collection('urls');

module.exports = async (req, res) => {
	res.setHeader('Cache-Control', 's-maxage=1');
	res.setHeader('Pragma', 'no-cache');

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

	let referrer = req.headers.referrer;
	if (referrer) {
		clicksData.referrer = new URL(referrer).hostname;
	}

	const IP = getClientIp(req);
	if (IP && config.collect.length > 1 && process.env.IPDATA_KEY) {
		let apiURL = `https://api.ipdata.co/${IP}?api-key=${process.env.IPDATA_KEY}&fields=${config.collect}`;
		let data = await (await fetch(apiURL)).json();

		if (!data.message) {
			if (regex.collectIP.test(config.collect)) {
				data.ip = hash(data.ip).replace(/\//g, '');
				const userRef = db.doc(`clickers/${data.ip}`);
				const doc = await userRef.get();
				if (!doc.exists) {
					await userRef.set(data);
				}
			}
			for (let field in data) {
				clicksData[field] = data[field];
			}
		}
	}

	await urlRef.update({
		clicks: FieldValue.arrayUnion(clicksData)
	});

	console.log(`Redirecting ${IP} to ${id}`);

	const { url } = doc.data();
	res.redirect(308, url);
};