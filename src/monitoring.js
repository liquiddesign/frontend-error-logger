const errorTypes = {
	error: 'error',
	resourceMissing: 'resource-missing',
	warning: 'warning',
	promise: 'promise-error',
}

function logErrorData(errorData) {
	errorData = {...errorData, ...{ url: window.location.href }};
	const xhr = new XMLHttpRequest();

	xhr.open('POST', (window.baseUrl || window.location.origin) + '/vendor/liquiddesign/frontend-error-logger/src/logger.php', true);
	xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(errorData));
}

// Catch 404 + 500 resources
document.addEventListener('DOMContentLoaded', () => {
	// Create a PerformanceObserver instance
	const observer = new PerformanceObserver((list) => {
		const entries = list.getEntries();

		// Iterate through the performance entries
		entries.forEach((entry) => {
			if (entry.entryType === 'resource' && entry.responseStatus === 404 || entry.responseStatus === 500) {
				logErrorData({
					message: 'Invalid or missing source',
					type: entry.responseStatus === 500 ? errorTypes.error : errorTypes.resourceMissing,
					filename: entry.name || null,
					element: entry.initiatorType,
					note: entry.initiatorType === 'css' ? "Resource as part of css 'style'" : null,
				});
			}
		});
	});

	// Start observing resource entries
	observer.observe({ type: 'resource', buffered: true });
});

// Catch Errors
window.addEventListener('error', error => {
	let errorData = {
		message: error.message,
		type: error.type.toString(),
		filename: error.filename ?? null,
		element: null,
	};

	// If target is HTML Element save it
	if (error.target.nodeName) {
		errorData.element = error.target.outerHTML;
	}

	// Check if error is Missing SOURCE
	if (error.target.nodeName === 'IMG' || error.target.nodeName === 'SOURCE' || error.target.nodeName === 'IFRAME' || error.target.nodeName === 'VIDEO') {
		errorData.filename = error.target.src || error.target.srcset;
		errorData.message = 'Invalid or missing source';
		errorData.type = errorTypes.resourceMissing;
	}

	logErrorData(errorData);
}, true);

// Catch warnings
window.addEventListener('message', warning => {
	logErrorData({
		message: warning.scriptUrl || (warning.data || null),
		type: errorTypes.warning,
		filename: null,
		origin: warning.origin,
	})
}, true)


// Catch Fetch errors
window.addEventListener('unhandledrejection', event => {
	let errorData = {
		message: event.reason.stack.toString(),
		type: event.reason.name || errorTypes.promise,
		filename: null,
		element: null,
	};

	if (event.reason?.response.status) {
		errorData.message = `Status: ${event.reason?.response.status} ${event.reason?.response.url} ${event.reason.stack.toString()}`
	}

	logErrorData(errorData);
	event.preventDefault();
});
