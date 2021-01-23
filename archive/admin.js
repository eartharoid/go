// get all URLs and display admin interface
const { readFileSync } = require('fs');
const { join } = require('path');

let html = readFileSync(join(__dirname, '../templates/admin.html'), 'utf8');

module.exports = (req, res) => {
	if (!req.body) {
		return res.status(400).json({
			status: 400,
			message: 'Bad Request'
		});
	}

	let { password } = req.body;

	if (password !== process.env.ADMIN_PASSWORD) {
		return res.status(401).json({
			status: 401,
			message: 'Unauthorized (invalid password)'
		});
	}

	let headers = ['Name', 'URL', 'Date', 'IP', 'Clicks'];
	let rows = [];
	let urls = {
		1: {
			name: 'short url',
			url: 'long url',
			date: 'date',
			ip: 'ip',
			clicks: 'clicks'
		}
	}

	for (let url in urls) {
		let row = [];
		for (let property in urls[url]) {
			row.push(`<td>${urls[url][property]}</td>`);
		}
		rows.push(row);
	}

	html = html
		.replace(/%%th%%/gm, headers.map(h => `<th>${h}</th>`).join('\n'))
		.replace(/%%tr%%/gm, rows.map(r => `<tr>${r.join('\n')}</tr>`).join('\n'));
	res.status(200).send(html);
};