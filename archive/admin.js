// login

const { hash } = require('../functions.js');
const { readFileSync } = require('fs');
const { join } = require('path');

const firebase = require('firebase-admin');


firebase.initializeApp({
	credential: firebase.credential.cert(JSON.parse(process.env.FIREBASE))
});

const db = firebase.firestore();
let admin = readFileSync(join(__dirname, '../templates/admin.html'), 'utf8');
let login = readFileSync(join(__dirname, '../templates/login.html'), 'utf8');


module.exports = async (req, res) => {

	let columns = ['Name', 'URL', 'Date', 'IP', 'Clicks', 'Manage'];
	let rows = [];

	const urlsRef = db.collection('urls');
	const snapshot = await urlsRef.orderBy('created', 'desc').get();
	snapshot.forEach(doc => {
		let data = doc.data();
		data.clicks = data.clicks.length;
		rows.push(`
		<tr>
		<td><a href='${data.url}' target='_blank'>${data.name}</a></td>
		<td class='is-size-7'><a href='${data.url}' target='_blank'>${data.url}</a></td>
		<td>${(new Date(data.created.seconds * 1000)).toLocaleString()}</td>
		<td>${data.creator}</td>
		<td>${data.clicks}</td>
		<td>buttons</td>
		</tr>
		`);
	});

	admin = admin
		.replace(/%%th%%/gmi, columns.map(h => `<th>${h}</th>`).join('\n'))
		// .replace(/%%tr%%/gmi, rows.map(r => `<tr>${r.join('\n')}</tr>`).join('\n'));
		.replace(/%%tr%%/gmi, rows.join('\n'));

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