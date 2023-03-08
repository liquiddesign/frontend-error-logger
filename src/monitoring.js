function logErrorData(errorData) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', window.baseUrl || window.location.origin + '/vendor/liquiddesign/frontend-error-logger/src/logger.php', true);
	xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(errorData));
}

window.addEventListener('error', error => {
	let errorData = {
		message: error.message,
		type: error.type.toString(),
		filename: error.filename ?? null,
		element: null,
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
		message: event.reason.stack.toString(),
		type: event.reason.name ?? "Promise error",
		filename: null,
		element: null,
		url: window.location.href
	};

	if (event.reason?.response.status) {
		errorData.message = `Status: ${event.reason?.response.status} ${event.reason?.response.url} ${event.reason.stack.toString()}`
	}

	logErrorData(errorData);
	event.preventDefault();
});
