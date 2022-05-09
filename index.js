import { Router } from 'itty-router';
import qr from 'qr-image';
import { render } from 'mustache';

const getRef = request => {
	const { headers } = request;
	let ref = headers.get('Referer') || headers.get('Origin');
	if (ref) ref = ref.replace(/^http(s)?:\/\//gi, '').replace(/(\?.*)|#.*/g, '');
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

router.get('/', request => {
	umami(request);
	return Response.redirect('https://eartharoid.me', 302);
});

router.get('/:id.png', request => {
	// umami(request); // don't send this
	const id = decodeURIComponent(request.params.id);
	const host = request.headers.get('Host');
	const image = qr.imageSync(`https://${host}/${id}`, {
		margin: 2,
		size: 6,
	});
	return new Response(image, { headers: { 'Content-Type': 'image/png' } });
});

router.get('/:id\\~', async request => {
	umami(request);
	const id = decodeURIComponent(request.params.id);
	const long = await LINKS.get(id, { cacheTtl: 3600 });
	if (!long) return Response.redirect('https://eartharoid.me', 302); // invalid
	const { hostname } = new URL(long);
	let html = await (await fetch('https://static.lnk.earth/preview.html')).text();
	html = render(html, {
		hostname,
		id,
		long,
	});
	return new Response(html, { headers: { 'content-type': 'text/html;charset=UTF-8' } });
});

router.get('/:id\\+', request => {
	// umami(request); // don't send this
	const id = decodeURIComponent(request.params.id);
	return Response.redirect(`${UMAMI}/share/${UMAMI_SHARE}?url=%2F${request.params.id}`, 302);
});

router.get('/:id', async request => {
	umami(request);
	const id = decodeURIComponent(request.params.id);
	const long = await LINKS.get(id, { cacheTtl: 3600 });
	if (!long) return Response.redirect('https://eartharoid.me', 302); // invalid
	return Response.redirect(long, 302);
});

router.all('*', () =>
	// umami(request); // don't send this
	 Response.redirect('https://eartharoid.me', 302),
);

addEventListener('fetch', event => {
	event.respondWith(router.handle(event.request));
});
