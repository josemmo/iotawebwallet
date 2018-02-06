<?php
require __DIR__ . "/app/autoload.php";
forceHTTPS();
ob_start("compressHTML");
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>IOTA Web Wallet</title>
    <meta name="theme-color" content="#04A997">
    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,900" rel="stylesheet">
    <link href="css/bootstrap.custom.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/datatables/<?= DEP_DATATABLES_VERSION; ?>/css/dataTables.bootstrap4.min.css" rel="stylesheet">
    <link href="css/app.css?v=<?= APP_VERSION; ?>" rel="stylesheet">
  </head>
  <body>
    <!-- NAVBAR -->
    <nav class="navbar navbar-expand p-0">
      <a class="navbar-brand" href="."></a>
      <h1 class="navbar-title d-none d-md-block">iotawebwallet.com <small>v<?= APP_VERSION; ?></small></h1>
      <a class="navbar-wallet-dropdown ml-auto" tabindex="0">
        <span class="title">Current Wallet</span>
        <span class="subtitle"></span>
      </a>
      <a class="navbar-refresh"></a>
    </nav>

    <div class="container-fluid">
      <div class="row">
        <!-- SIDEBAR -->
        <nav class="sidebar">
          <ul class="nav flex-column">
              <li class="nav-item">
                <a class="nav-link" href="#!/summary/">
                  <?php readfile(__DIR__ . "/images/summary.svg"); ?> Summary
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#!/send/">
                  <?php readfile(__DIR__ . "/images/send.svg"); ?> Send
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#!/receive/">
                  <?php readfile(__DIR__ . "/images/receive.svg"); ?> Receive
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#!/history/">
                  <?php readfile(__DIR__ . "/images/history.svg"); ?> History
                </a>
              </li>
              <li class="nav-item pt-5">
                <a class="nav-link" href="#!/settings/">
                  <?php readfile(__DIR__ . "/images/settings.svg"); ?> Settings
                </a>
              </li>
            </ul>
        </nav>

        <!-- PAGE RENDERER -->
        <main class="col px-0 py-3 renderer">
          <?php readfile(__DIR__ . "/app/components/page-unloaded.html"); ?>
          <?php readfile(__DIR__ . "/app/components/page-summary.html"); ?>
          <?php readfile(__DIR__ . "/app/components/page-send.html"); ?>
          <?php readfile(__DIR__ . "/app/components/page-receive.html"); ?>
          <?php readfile(__DIR__ . "/app/components/page-history.html"); ?>
          <?php readfile(__DIR__ . "/app/components/page-settings.html"); ?>
        </main>
      </div>
    </div>


    <!-- MODALS -->
    <?php readfile(__DIR__ . "/app/components/modal-new-wallet.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-import-wallet.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-edit-wallet.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-delete-wallet.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-delete-all.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-enter-password.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-wallet-die.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-sending-transaction.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-transaction-sent.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-transaction-error.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-attaching.html"); ?>
    <?php readfile(__DIR__ . "/app/components/modal-attach-error.html"); ?>


    <!-- SCRIPTS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/<?= DEP_JQUERY_VERSION; ?>/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/<?= DEP_POPPER_VERSION; ?>/umd/popper.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/<?= DEP_BOOTSTRAP_VERSION; ?>/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/<?= DEP_MOMENT_VERSION; ?>/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/<?= DEP_CRYPTOJS_VERSION; ?>/crypto-js.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/iota.lib.js@<?= DEP_IOTA_VERSION; ?>/dist/iota.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/davidshimjs-qrcodejs@<?= DEP_QRCODE_VERSION; ?>/qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/datatables/<?= DEP_DATATABLES_VERSION; ?>/js/jquery.dataTables.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/datatables/<?= DEP_DATATABLES_VERSION; ?>/js/dataTables.bootstrap4.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/<?= DEP_CHARTJS_VERSION; ?>/Chart.min.js"></script>
    <script src="js/app.js?v=<?= APP_VERSION; ?>"></script>
  </body>
</html>
