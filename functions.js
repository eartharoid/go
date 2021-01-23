const crypto = require('crypto');
const config = require('./config.json');

module.exports = {
	hash(password) {
		return crypto
			.createHash('sha256')
			.update(password)
			.digest('base64');
	},
	random(length = config.random_length) {
		let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let str = '';
		for (let i = 0; i < length; i++) {
			str += characters[Math.floor(Math.random() * characters.length)];
		}
		return str;
	}
};