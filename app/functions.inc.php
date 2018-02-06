<?php
/**
 * Force HTTPS
 */
function forceHTTPS() {
  if (isset($_SERVER['HTTP_CF_VISITOR'])) {
    $visitor = json_decode($_SERVER['HTTP_CF_VISITOR']);
    if ($visitor->scheme == "http") {
      http_response_code(301);
      header('Location: https://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI']);
      exit;
    }
  }
}


/**
 * Compress HTML
 * @param  string $buffer Page buffer
 * @return string         Compressed buffer
 */
function compressHTML($buffer) {
  $search = array(
    '/\>[^\S ]+/s',      // Strip whitespaces after tags, except space
    '/[^\S ]+\</s',      // Strip whitespaces before tags, except space
    '/(\s)+/s',          // Shorten multiple whitespace sequences
    '/<!--(.|\s)*?-->/', // Remove HTML comments
    '/>(\s+)</s'         // Remove spaces between HTML elements
  );
  $replace = array(
    '>',
    '<',
    '\\1',
    '',
    '><'
  );
  $buffer = preg_replace($search, $replace, $buffer);
  return $buffer;
}
