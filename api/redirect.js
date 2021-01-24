// redirect to the long URL

module.exports = (req, res) => {
	const { url = '/' } = req.query;

	/**
	 * req.headers.referer
	 */
	// https://ipdata.co/
	res.status(200).send(`REDIRECT ${url}`);
	// res.redirect(308, url)
}