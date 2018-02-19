/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect
// chai.use(require('dirty-chai'))

const fs = require('fs')
const path = require('path')
const copy = require('copy-concurrently')
const pify = require('pify')
const mkdirp = pify(require('mkdirp'))
const rimraf = pify(require('rimraf'))
const sourceDir = 'tmp/runner/source'
const targetDir = 'tmp/runner/target'
const listFiles = pify(require('recursive-readdir'))

const runner = require('../lib/runner')

describe('The runner', function () {
  beforeEach(async function () {
    await Promise.all([rimraf(sourceDir), rimraf(targetDir)])
    await Promise.all([mkdirp(path.dirname(sourceDir)), mkdirp(targetDir)])
    await copy('test/fixtures', sourceDir)
  })

  it('should put images and videos into a month-based dir-structure', async function () {
    await runner(sourceDir, targetDir)
    expect(await listFiles(targetDir)).to.deep.equal([
      'tmp/runner/target/2016/04/2016-04-01__20-23-42-gt-i8190.jpg',
      'tmp/runner/target/2016/08/2016-08-02__11-00-53-p1050073.jpg'
    ])
  })
})
