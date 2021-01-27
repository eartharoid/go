// login

const config = require('../config.json');
const { hash } = require('../functions.js');
const { readFileSync } = require('fs');
const { join } = require('path');

const mustache = require('mustache');

const firebase = require('firebase-admin');

firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
});

const db = firebase.firestore();
let admin = readFileSync(join(__dirname, '../templates/admin.html'), 'utf8');
let login = readFileSync(join(__dirname, '../templates/login.html'), 'utf8');


module.exports = async (req, res) => {

	let links = [];
	let totalClicks = 0;
	let uniqueClicks = 0;

	const urlsRef = db.collection('urls');
	const urls_snapshot = await urlsRef.orderBy('created', 'desc').get();
	urls_snapshot.forEach(doc => {
		let data = doc.data();

		totalClicks += data.clicks.length;
		uniqueClicks += new Set(data.clicks.map(c => c.ip)).size;

		data.clicks = data.clicks.length;
		data.created = (new Date(data.created.seconds * 1000)).toLocaleString();
		data.stats = `${config.host}/${doc.id}+`;
		data.preview = `${config.host}/${doc.id}~`;
		data.truncated_url = data.url.substring(0, 40) + (data.url.length > 40 ? '...' : '');

		links.push(data);
	});

	const clickers_snapshot = await db.collection('clickers').get();
	let clickers = clickers_snapshot.size;

	admin = mustache.render(admin, {
		links,
		totalLinks: links.length,
		totalClicks,
		uniqueClicks,
		clickers,
	});

	if (req.cookies && req.cookies.password === hash(process.env.ADMIN_PASSWORD)) {
		return res.status(200).send(admin);
	} else if (!req.body) {
		return res.status(200).send(login);
	} else {
		let { password } = req.body;

		if (password !== process.env.ADMIN_PASSWORD) {
			console.log('Someone tried to access the admin dashboard with the wrong password');
			return res.status(401).json({
				status: 401,
				message: 'Unauthorized (invalid password)'
			});
		}

		res.setHeader('Set-Cookie', `password=${hash(password)}`);
		return res.status(200).send(admin);
	}

};