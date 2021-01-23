// login

const { hash } = require('../functions.js');
const { readFileSync } = require('fs');
const { join } = require('path');

let admin = readFileSync(join(__dirname, '../templates/admin.html'), 'utf8');
let login = readFileSync(join(__dirname, '../templates/login.html'), 'utf8');


module.exports = (req, res) => {

	if (req.cookies && req.cookies.password === hash(process.env.ADMIN_PASSWORD)) {
		return res.status(200).send(admin);
	} else if (!req.body) {
		return res.status(200).send(login);
	} else {
		let { password } = req.body;

		if (password !== process.env.ADMIN_PASSWORD) {
			return res.status(401).json({
				status: 401,
				message: 'Unauthorized (invalid password)'
			});
		}

		res.setHeader('Set-Cookie', `password=${hash(password)}`)
		return res.status(200).send(admin);
	}

};