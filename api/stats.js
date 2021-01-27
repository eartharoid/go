// get stats

const config = require('../config.json');

const { readFileSync } = require('fs');
const { join } = require('path');

let stats = readFileSync(join(__dirname, '../templates/stats.html'), 'utf8');

const firebase = require('firebase-admin');


firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
});

const db = firebase.firestore();
const links = db.collection('urls');

const mustache = require('mustache');

module.exports = async (req, res) => {

	let { id } = req.query;

	if (!id) {
		return res.status(400).json({
			status: 400,
			message: 'No short URL ID provided'
		});
	}

	const urlRef = links.doc(id);
	const doc = await urlRef.get();

	if (!doc.exists) {
		return res.status(404).json({
			status: 404,
			message: 'Short URL with that ID does not exist'
		});
	}

	let data = doc.data();
	
	delete data.ip;

	let totalClicks = data.clicks.length;
	let uniqueClicks = new Set(data.clicks.map(c => c.ip)).size;
	let countries = {};
	data.clicks.forEach(c => {
		if (!c.country_name) {
			return;
		}
		if (!countries[c.country_name]) {
			countries[c.country_name] = {
				count: 0,
				flag: c.flag ? `https://proxy.duckduckgo.com/iu/?u=${encodeURI(c.flag)}` : '',
				name: c.country_name
			};
		}
		countries[c.country_name].count ++;
	});

	countries = Object.values(countries).sort((a, b) => b.count - a.count);

	for (let i = 0; i < countries.length; i++) {
		countries[i].position = i + 1;
	}

	stats = mustache.render(stats, {
		data: JSON.stringify(data),
		id,
		api_key: config.gmaps_key,
		created: (new Date(data.created.seconds * 1000)).toLocaleString(),
		totalClicks,
		uniqueClicks,
		countries
	});

	return res.status(200).send(stats);
};