// get information about a URL

const config = require('../config.json');
const { hash } = require('../functions.js');

const firebase = require('firebase-admin');


firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
});

const db = firebase.firestore();
const links = db.collection('urls');

module.exports = async (req, res) => {

	let { password, id } = req.query;

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

	const urlRef = links.doc(id);
	const doc = await urlRef.get();

	if (!doc.exists) {
		return res.status(404).json({
			status: 404,
			message: 'Short URL with that ID does not exist'
		});
	}

	let data = doc.data();
	data.short = `${config.host}/${id}`;

	res.status(200).json(data);
};