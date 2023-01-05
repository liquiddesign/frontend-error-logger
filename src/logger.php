<?php

require __DIR__ . '/../../../autoload.php';

use Tracy\Debugger;
use Tracy\ILogger;

$bootstrapClass = 'App\Bootstrap';

/** @var \Nette\DI\Container $container */
$container = $bootstrapClass::boot()->createContainer();

/** @var \Nette\Http\Request $request */
$request = $container->getByType(\Nette\Http\Request::class);

$errorData = $request->getRawBody();

if (!$errorData) {
	die;
}

$errorData = \json_decode($errorData);

if (!$errorData) {
	die;
}

$message = "$errorData->type: "
	. (\is_object($errorData->message) ? \json_encode($errorData->message) : $errorData->message)
	. ($errorData->filename ? " in $errorData->filename" : "")
	. ($errorData->element ? " on element $errorData->element" : "")
	. " called at URL $errorData->url";


Debugger::log($message, ILogger::ERROR);