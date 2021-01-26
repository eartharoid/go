// get preview

const config = require('../config.json');
const { regex } = require('../globals.js');
const { hash } = require('../functions.js');
const { getClientIp } = require('@supercharge/request-ip');
const fetch = require('node-fetch');

const { readFileSync } = require('fs');
const { join } = require('path');

let preview = readFileSync(join(__dirname, '../templates/preview.html'), 'utf8');

const firebase = require('firebase-admin');
const { FieldValue } = firebase.firestore;

firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
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
			if (regex.collectIP.test(config.collect)) {
				data.ip = hash(data.ip);
			}

			for (let field in data) {
				clicksData[field] = data[field];
			}
		}
	}

	urlRef.update({
		clicks: FieldValue.arrayUnion(clicksData)
	});

	console.log(`Redirecting ${IP} to ${id}`);

	let data = doc.data();

	return res.status(200).send(
		preview
			.replace(/%%ID%%/gmi, id)
			.replace(/%%SHORT%%/gmi, `${config.host}/${id}`)
			.replace(/%%LONG%%/gmi, data.url)
	);
};