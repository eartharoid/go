const button = document.getElementById('button');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const successQR = document.getElementById('successQR');
const shortURL = document.getElementById('shortURL');

function getValue(name) {
	return document.getElementsByName(name)[0].value;
}

function shorten(e, form) {
	e.preventDefault();

	button.classList.add('is-loading');
	successMessage.style.display = 'none';
	errorMessage.style.display = 'none';

	fetch(form.action, {
		method: form.method,
		body: JSON.stringify({
			protocol: getValue('protocol'),
			url: getValue('long'),
			slug: getValue('slug'),
			password: getValue('password')
		}),
		headers: {
			'Content-Type': 'application/json'
		},
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				errorMessage.style.display = 'none';
				successQR.href = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${data.short}`;
				successMessage.style.display = 'block';
				shortURL.value = data.short;
				shortURL.select();
				shortURL.setSelectionRange(0, shortURL.value.length); // mobile
				console.log(data);
				form.reset();
			} else {
				successMessage.style.display = 'none';
				errorMessage.innerText = data.message;
				errorMessage.style.display = 'block';
			}
		})
		.catch(error => {
			console.log(error.message);
			successMessage.style.display = 'none';
			errorMessage.innerText = 'An error occurred; please check the developer console.';
			errorMessage.style.display = 'block';
		})
		.finally(() => {
			button.classList.remove('is-loading');
		});
}

function slugify(element, away) {
	element.value = element.value
		.replace(/(\/)?(\+)?/g, '')
		.replace(/#\S*/g, '')
		.replace(/\?\S*/g, '')
		.replace(/\s/g, '-');
	if (element.value.startsWith('-') || element.value.endsWith('-')) {
		element.classList.add('is-danger');
		if (away) {
			errorMessage.innerText = 'Short URL name must not begin or end with a hyphen.';
			errorMessage.style.display = 'block';
		}
	} else {
		element.classList.remove('is-danger');
		errorMessage.style.display = 'none';
	}
}

function deurlize(element) {
	element.value = element.value
		.replace(/^http(s)?:\/\//i, '');
}

function copy(button) {
	shortURL.select();
	shortURL.setSelectionRange(0, shortURL.value.length); // mobile
	document.execCommand('copy');
	button.innerHTML =
		`<span class='icon'>
					<i class='fas fa-check'></i>
				</span>
				<span>Copied</span>`;
}