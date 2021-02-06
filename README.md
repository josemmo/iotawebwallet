# IOTA Web Wallet
[![Open Web App](https://img.shields.io/badge/open-webapp-04a997.svg)](https://iotawebwallet.com/)
[![Build Status](https://github.com/josemmo/iotawebwallet/workflows/Deploy/badge.svg)](https://github.com/josemmo/iotawebwallet/actions)
[![License](https://img.shields.io/github/license/josemmo/iotawebwallet.svg)](COPYING)

[IOTA Web Wallet](https://iotawebwallet.com/) is an Open Source and Free Software project that aims to provide a reliable and complete app for managing IOTA wallets directly from the web.

It uses the official [iota.js](https://github.com/iotaledger/iota.js) library to perform all Tangle-related operations. It also encrypts your seeds and stores them in your browser local storage instead of sending them to a third-party server.

## Building the app
If you prefer to build the app yourself instead of using the latest version online, you'll need NodeJS with NPM/Yarn:
```bash
# Clone this repository
git clone https://github.com/josemmo/iotawebwallet
cd iotawebwallet

# Install dependencies
npm install

# Build the app
npm run build
```

## License
IOTA Web Wallet is provided under the [GNU General Public License](COPYING) and uses libraries under MIT and WTFPL licenses.
