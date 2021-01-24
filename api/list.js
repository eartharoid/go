// get all URLs

const { hash } = require('../functions.js');

const firebase = require('firebase-admin');
const serviceAccount = require('../firebase.json');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount)
});

const db = firebase.firestore();
const links = db.collection('urls');

module.exports = async (req, res) => {

	let { password } = req.query;

	if ((password !== process.env.ADMIN_PASSWORD) && (req.cookies.password !== hash(process.env.ADMIN_PASSWORD))) {
		return res.status(401).json({
			status: 401,
			message: 'Unauthorized (invalid password)'
		});
	}

	let links = {};

	const urlsRef = db.collection('urls');
	const snapshot = await urlsRef.get();
	snapshot.forEach(doc => {
		links[doc.id] = doc.data();
	});

	res.status(200).json(links);
}