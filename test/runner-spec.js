/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect
// chai.use(require('dirty-chai'))

const path = require('path')
const copy = require('copy-concurrently')
const pify = require('pify')
const mkdirp = pify(require('mkdirp'))
const rimraf = pify(require('rimraf'))
const sourceDir = 'tmp/runner/source'
const targetDir = 'tmp/runner/target'
const listFiles = pify(require('recursive-readdir'))
const fs = require('fs')

const {Runner} = require('../lib/runner')

process.on('unhandledRejection', function (error) {
// eslint-disable-next-line no-console
  console.log(error.stack)
})

describe('The runner', function () {
  this.timeout(20000)
  beforeEach(async function () {
    await Promise.all([rimraf(sourceDir), rimraf(targetDir)])
    await Promise.all([mkdirp(path.dirname(sourceDir)), mkdirp(targetDir)])
    await copy('test/fixtures', sourceDir)
    fs.utimesSync(
      path.resolve(sourceDir, '0088_some_name_20161007-JQ3E6311.jpg'),
      new Date(),
      new Date('2016-10-07T15:15:15Z')
    )
  })

  it('should put images and videos into a month-based dir-structure', async function () {
    const targetFileChecks = []
    await new Runner(sourceDir, targetDir)
      .on('targetFileCheck', (source, target, targetFileCheck) => targetFileChecks.push({
        source,
        target,
        targetFileCheck
      }))
      .run()
    let files = await listFiles(targetDir)
    files.sort()
    expect(files).to.deep.equal([
      'tmp/runner/target/2007/10/2007-10-01__12-00-00-bild137.jpg',
      'tmp/runner/target/2008/09/2008-09-08__03-24-35-p9080161.jpg',
      'tmp/runner/target/2008/09/2008-09-08__04-14-53-p9080175.avi',
      'tmp/runner/target/2015/08/2015-08-19__11-39-04-003.jpg',
      'tmp/runner/target/2015/08/2015-08-19__11-39-04-198.jpg',
      'tmp/runner/target/2015/08/2015-08-19__11-39-04-p1010301.jpg',
      'tmp/runner/target/2015/08/2015-08-19__11-39-04-p8020152.jpg',
      'tmp/runner/target/2016/04/2016-04-01__20-23-43-gt-i8190.jpg',
      'tmp/runner/target/2016/08/2016-08-02__11-00-53-p1050073.jpg',
      'tmp/runner/target/2016/10/2016-10-07__17-15-15-0088-some_name-jq3e6311.jpg',
      'tmp/runner/target/2017/07/2017-07-27__12-28-35-some-video.mp4',
      'tmp/runner/target/2017/07/2017-07-27__14-28-29-vid.mp4'
    ])
    expect(targetFileChecks).to.deep.equal([
      {
        'source': 'tmp/runner/source/2015-08-19_P1010301.JPG',
        'target': '/home/nknappmeier/projects/gachou/group-by-date/tmp/runner/target/2015/08/2015-08-19__11-39-04-p1010301.jpg',
        'targetFileCheck': {
          'diff': [
            {
              'op': 'replace',
              'path': [
                'File:FileAccessDate'
              ],
              'value': '2018-03-01T00:13:03+0100'
            }
          ],
          'exists': true,
          'samePixels': true
        }
      }
    ])
  })
})
