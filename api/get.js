// get information about a URL

const { hash } = require('../functions.js');

const firebase = require('firebase-admin');
const serviceAccount = require('../firebase.json');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount)
});

const db = firebase.firestore();
const links = db.collection('urls');

module.exports = async (req, res) => {

	let { password, name } = req.query;

	if (password !== process.env.ADMIN_PASSWORD
		&& req.cookies?.password !== hash(process.env.ADMIN_PASSWORD)
		&& hash(req.cookies?.password) !== hash(process.env.ADMIN_PASSWORD)) {
		console.log('Someone tried to get a URL with the wrong password');
		return res.status(401).json({
			status: 401,
			message: 'Unauthorized (invalid password)'
		});
	}

	if (!name) {
		return res.status(400).json({
			status: 400,
			message: 'No short URL name provided'
		});
	}

	const urlRef = links.doc(name);
	const doc = await urlRef.get();

	if (!doc.exists) {
		return res.status(404).json({
			status: 404,
			message: 'Short URL with that name does not exist'
		});
	}

	res.status(200).json(doc.data());
};