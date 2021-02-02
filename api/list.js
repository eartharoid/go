// get all URLs

const config = require('../config.json');
const { hash } = require('../functions.js');

const firebase = require('firebase-admin');


firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
});

const db = firebase.firestore();

module.exports = async (req, res) => {

	let { password } = req.query;

	if (password !== process.env.ADMIN_PASSWORD
		&& req.cookies.password !== hash(process.env.ADMIN_PASSWORD)
		&& hash(req.cookies.password) !== hash(process.env.ADMIN_PASSWORD)) {
		console.log('Someone tried to list all URLs with the wrong password');
		return res.status(401).json({
			status: 401,
			message: 'Unauthorized (invalid password)'
		});
	}

	let links = [];

	const urlsRef = db.collection('urls');
	const snapshot = await urlsRef.orderBy('created', 'desc').get();
	snapshot.forEach(doc => {
		let data = doc.data();
		data.clicks = data.clicks.length;
		data.short = `${config.host}/${doc.id}`;
		links.push(data);
	});

	res.status(200).json(links);
};