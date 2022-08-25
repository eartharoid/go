/* eslint-disable no-undef */

import { Router } from 'itty-router';
import qr from 'qr-image';
import Mustache from 'mustache';

const CACHE_FOR = 3600;

const getRef = request => {
	const { headers } = request;
	let ref = headers.get('Referer') || headers.get('Origin');
	if (ref) ref = ref.replace(/^http(s)?:\/\//gi, '').replace(/(\?.*)|#.*/g, '');
	console.log(ref);
	return ref;
};

const getLang = request => {
	const { headers } = request;
	let lang = headers.get['Accept-Language'] || '';
	lang = lang.split(',');
	return lang[0];
};

const umami = request => {
	let { headers } = request;
	headers = new Headers(headers);
	headers.set('Content-Type', 'application/json');
	fetch(
		new Request(UMAMI + '/api/collect', {
			body: JSON.stringify({
				payload: {
					language: getLang(request),
					referrer: getRef(request),
					screen: '1920x1080',
					url: new URL(request.url).pathname,
					website: UMAMI_SITE_ID,
				},
				type: 'pageview',
			}),
			headers,
			method: 'POST',
		}),
	);
};

const router = Router();

router.get('/', () => Response.redirect('https://eartharoid.me', 302));

router.get('/favicon.ico', () => Response.redirect('https://eartharoid.me/favicon.ico', 301));

router.get('/:id.png', request => {
	const id = decodeURIComponent(request.params.id);
	const host = request.headers.get('Host');
	const image = qr.imageSync(`https://${host}/${id}`, {
		margin: 2,
		size: 6,
	});
	return new Response(image, { headers: { 'Content-Type': 'image/png' } });
});

router.get('/:id\\~', async request => {
	let [id, addon] = decodeURIComponent(request.params.id).split(':');
	id = id.replaceAll('-', '').toLowerCase();
	const long = await LINKS.get(id, { cacheTtl: CACHE_FOR });
	let html, status;

	if (!long) {
		html = await (await fetch('https://static.lnk.earth/invalid.html')).text();
		html = Mustache.render(html, { id });
		status = 404;
	} else {
		umami(request);
		const { hostname } = new URL(long);
		html = await (await fetch('https://static.lnk.earth/preview.html')).text();
		html = Mustache.render(html, {
			hostname,
			id: addon ? id + ':' + addon : id,
			long: addon ? long + '#' + addon : long,
		});
		status = 200;
	}

	return new Response(html, {
		headers: { 'content-type': 'text/html;charset=UTF-8' },
		status,
	});
});

router.get('/:id\\+', request => Response.redirect(`${UMAMI}/share/${UMAMI_SHARE}?url=%2F${request.params.id}`, 302));

router.get('/:id', async request => {
	let [id, addon] = decodeURIComponent(request.params.id).split(':');
	let id = id.replaceAll('-', '').toLowerCase()
	const long = await LINKS.get(id, { cacheTtl: CACHE_FOR });

	if (!long) {
		let html = await (await fetch('https://static.lnk.earth/invalid.html')).text();
		html = Mustache.render(html, { id });
		return new Response(html, {
			headers: { 'content-type': 'text/html;charset=UTF-8' },
			status: 404,
		});
	} else {
		umami(request);
		return Response.redirect(addon ? long + '#' + addon : long, 302);
	}
});

router.all('*', () =>
	Response.redirect('https://eartharoid.me', 302),
);

addEventListener('fetch', event => {
	event.respondWith(router.handle(event.request));
});
