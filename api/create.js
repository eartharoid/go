// create a new URL

const config = require('../config.json');
const { hash, random } = require('../functions.js');
const firebase = require('firebase-admin');
const serviceAccount = require('../firebase.json');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount)
});

const db = firebase.firestore();

const links = db.collection('urls');

module.exports = (req, res) => {
	if (!req.body) {
		return res.status(400).json({
			status: 400,
			message: 'Bad Request'
		})
	}

	let {
		protocol,
		url,
		slug,
		password
	} = req.body;

	if (!protocol || !url) {
		return res.status(400).json({
			status: 400,
			message: 'Bad Request'
		});
	}

	if (password !== process.env.ADMIN_PASSWORD && req.cookies?.password !== hash(process.env.ADMIN_PASSWORD)) {
		return res.status(401).json({
			status: 401,
			message: 'Unauthorized (invalid password)'
		});
	}

	if (slug.length < 1) {
		slug = random();
		// IF ONE ALREADY EXISTS WITH THIS SLUG, REGENERATE ANOTHER
	} else {
		slug = slug
			.replace(/(\/)?(\+)?/g, '')
			.replace(/#\S*/g, '')
			.replace(/\?\S*/g, '')
			.replace(/\s/g, '-')
			.trim();
	}

	let exists = false;

	if (exists || config.reserved.includes(slug)) {
		return res.status(409).json({
			status: 409,
			message: 'Conflict: A short URL with this name already exists; please delete it to re-assign.'
		});
	}

	url = protocol + url
		.replace(/^http(s)?:\/\//i, '')
		.trim();
	url = encodeURI(url);

	

	res.status(200).send({
		success: true,
		long: url,
		short: `${req.headers.origin}/${slug}`,
		stats: `${req.headers.origin}/${slug}+`,
		slug
	});
}