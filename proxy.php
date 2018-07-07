<?php
// Prevent direct execution of script
if (strpos($_SERVER['REQUEST_URI'], ".php") !== false) {
	http_response_code(404);
	exit;
}

// Get proxy type
$type = $_GET['type'];
$files = array();
if ($type == "js") {
	header("Content-Type: application/javascript; charset=utf-8");
  $files = [
		"js/prototype.js",
		"js/pagination.js",
		"js/page.settings.js",
		"js/iotaController.js",
		"js/walletManager.js",
		"js/page.send.js",
		"js/page.tools.js"
	];
} elseif ($type == "css") {
	header("Content-Type: text/css; charset=utf-8");
  $files = [
		"css/theme.css",
		"css/base.css",
		"css/sections.css",
		"css/page.summary.css",
		"css/page.receive.css",
		"css/page.history.css",
		"css/modal-new-wallet.css"
	];
}

// Merge files into output
foreach ($files as $path) {
  readfile(__DIR__ . "/$path");
  echo "\r\n";
}
