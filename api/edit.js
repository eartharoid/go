// get information about a URL

const { hash } = require('../functions.js');

const firebase = require('firebase-admin');

firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
});

const db = firebase.firestore();
const links = db.collection('urls');

module.exports = async (req, res) => {
	if (!req.body) {
		return res.status(400).json({
			status: 400,
			message: 'Bad Request'
		});
	}

	let { password, id, url } = req.body;
	if (!password) {
		password = req.query.password;
	}

	if (password !== process.env.ADMIN_PASSWORD
		&& req.cookies.password !== hash(process.env.ADMIN_PASSWORD)
		&& hash(req.cookies.password) !== hash(process.env.ADMIN_PASSWORD)) {
		console.log('Someone tried to get a URL with the wrong password');
		return res.status(401).json({
			status: 401,
			message: 'Unauthorized (invalid password)'
		});
	}

	if (!id) {
		return res.status(400).json({
			status: 400,
			message: 'No short URL ID provided'
		});
	}

	if (!url) {
		return res.status(400).json({
			status: 400,
			message: 'No new long URL provided'
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

	url = encodeURI(url.trim());

	const { regex } = require('../globals.js');
	if (!regex.url.test(url)) {
		return res.status(400).json({
			status: 400,
			message: 'Invalid URL'
		});
	}

	await urlRef.update({
		url
	});

	res.status(200).json({
		status: 200,
		success: true
	});
};
