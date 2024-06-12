const errorTypes = {
	error: 'error',
	missingResource: 'missing-resource',
	warning: 'warning',
}

function logErrorData(errorData) {
	if (!errorData.message) {
		return;
	}

	const xhr = new XMLHttpRequest();
	xhr.open('POST', (window.baseUrl || window.location.origin) + '/vendor/liquiddesign/frontend-error-logger/src/logger.php', true);
	xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(errorData));
}

function createErrorData(type, message, url, origin, filename, element, src) {
	return {
		type: type,
		message: message,
		url: url,
		filename: filename || null,
		origin: origin || null,
		element: element || null,
		src: src || null,
	}
}

// WARNINGS [catch & send]
window.addEventListener('message', warning => {
	logErrorData(
		createErrorData(errorTypes.warning, warning.data, window.location.href, warning.origin, null, null)
	);
});

document.addEventListener('DOMContentLoaded', () => {
	let srcs = [];

	document.querySelectorAll('img').forEach(el => {
		el.addEventListener('error', (error) => {
			logErrorData(
				createErrorData(errorTypes.missingResource, 'Image error', window.location.href, error.origin, error.filename || null, error.target.outerHTML || 'img', el.src || el.srcset)
			);
		});

		let src = el.getAttribute('src') || el.getAttribute('srcset');
		if (!srcs.includes(src)) {
			srcs.push(src);
		}
	});

	document.querySelectorAll('video').forEach(el => {
		el.addEventListener('error', (error) => {
			logErrorData(
				createErrorData(errorTypes.missingResource, 'Video error', window.location.href, error.origin, error.filename || null, error.target.outerHTML || 'video', el.src || el.srcset)
			);
		});

		let src = el.getAttribute('src') || el.getAttribute('srcset');
		if (!srcs.includes(src)) {
			srcs.push(src);
		}
	});

	srcs.forEach(src => {
		let element = new Image();
		element.src = src;
		element.style.display = 'none';
		document.body.appendChild(element);
		element.remove();
	})
});

window.addEventListener('error', error => {
	let errorData = {
		message: error.message,
		type: error.type.toString(),
		filename: error.filename || null,
		element: null,
		origin: error.origin,
		url: window.location.href
	};

	// If target is HTML Element save it
	if (error.target.nodeName) {
		errorData.element = error.target.outerHTML;
	}

	// Check if error is Missing SOURCE
	if (error.target.nodeName === 'IMG' || error.target.nodeName === 'SOURCE' || error.target.nodeName === 'IFRAME' || error.target.nodeName === 'VIDEO') {
		errorData.message = 'Invalid or missing source';
	}

	logErrorData(errorData);
}, true);



window.addEventListener('unhandledrejection', event => {
	let errorData = {
		type: errorTypes.error,
		message: (event.reason.name || '') + event.reason.stack.toString(),
		url: window.location.href,
		filename: null,
		origin: event.reason.origin,
		element: null,
		src:  null,
	};

	if (event.reason?.response.status) {
		errorData.message = `Status: ${event.reason?.response.status} ${event.reason?.response.url} ${event.reason.stack.toString()}`
	}

	logErrorData(errorData);
	event.preventDefault();
});