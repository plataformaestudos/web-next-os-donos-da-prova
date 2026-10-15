const { tmpdir } = require('node:os');
const { join } = require('node:path');

function loadChromium() {
  return require(process.env.ODP_PLAYWRIGHT_MODULE || 'playwright').chromium;
}

function artifactsPath(suite) {
  const root = process.env.ODP_CHECKOUT_ARTIFACTS_DIR || join(tmpdir(), 'odp-checkout-artifacts');
  return join(root, suite);
}

module.exports = { loadChromium, artifactsPath };
