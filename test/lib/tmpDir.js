const copy = require('copy-concurrently')
const pify = require('pify')
const mkdirp = pify(require('mkdirp'))
const rimraf = pify(require('rimraf'))
const path = require('path')

/* eslint-env mocha */

/**
 * Create a temporary directory that is reinitialize before each test
 * @param {string} tmpDir
 * @param {object=} options
 * @param {string=} options.from source path for initial data in the tmp dir
 */
function setupTmpDir (tmpDir, options) {
  beforeEach(async function () {
    await rimraf(tmpDir)
    if (options && options.from) {
      await mkdirp(path.dirname(tmpDir))
      await copy('test/fixtures', tmpDir)
    } else {
      await mkdirp(tmpDir)
    }
  })
}

module.exports = {
  setupTmpDir
}
