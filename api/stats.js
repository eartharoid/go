// get stats

const { readFileSync } = require('fs');
const { join } = require('path');

let stats = readFileSync(join(__dirname, '../templates/stats.html'), 'utf8');

const firebase = require('firebase-admin');
const serviceAccount = require('../firebase.json');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount)
});

const db = firebase.firestore();
const links = db.collection('urls');

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

	return res.status(200)
		.send(stats.replace(/%%ID%%/gmi, id));
};