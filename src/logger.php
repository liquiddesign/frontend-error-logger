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

Debugger::log($errorData, ILogger::ERROR);