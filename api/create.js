// create a new URL

const config = require('../config.json');
const { getClientIp } = require('@supercharge/request-ip');
const { hash, random } = require('../functions.js');

const firebase = require('firebase-admin');
// const { FieldValue } = firebase.firestore;

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

	if (password !== process.env.ADMIN_PASSWORD
		&& req.cookies.password !== hash(process.env.ADMIN_PASSWORD)
		&& hash(req.cookies.password) !== hash(process.env.ADMIN_PASSWORD)) {
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
			.replace(/(\/)?(\+)?(~)?/g, '')
			.replace(/#\S*/g, '')
			.replace(/\?\S*/g, '')
			.replace(/\s/g, '-')
			.trim();
	}

	url = protocol + url
		.replace(/^http(s)?:\/\//i, '')
		.trim();
	url = encodeURI(url);

	const { regex } = require('../globals.js');
	if (!regex.url.test(url)) {
		return res.status(400).json({
			status: 400,
			message: 'Invalid URL'
		});
	}

	const urlRef = links.doc(slug);
	const doc = await urlRef.get();
	if (doc.exists || config.reserved.includes(slug)) {
		return res.status(409).json({
			status: 409,
			message: 'Conflict: A short URL with this name already exists; please delete it to re-assign.'
		});
	}	

	await urlRef.set({
		clicks: [],
		// created: FieldValue.serverTimestamp(),
		created: new Date(),
		creator: getClientIp(req),
		name: slug,
		url: url
	});

	console.log(`Created new short URL: ${slug}`);
	return res.status(200).send({
		success: true,
		long: url,
		short: `${config.host}/${slug}`,
		stats: `${config.host}/${slug}+`,
		preview: `${config.host}/${slug}~`,
		slug
	});
};