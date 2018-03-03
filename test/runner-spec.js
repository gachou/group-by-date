/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect
// chai.use(require('dirty-chai'))

const path = require('path')
const moveFile = require('move-file')
const sourceDir = 'tmp/runner/source'
const targetDir = 'tmp/runner/target'
const pify = require('pify')
const listFiles = pify(require('recursive-readdir'))
const fs = require('fs')
const {setupTmpDir} = require('./lib/tmpDir')
const hasha = require('hasha')

const {Runner} = require('../lib/runner')

process.on('unhandledRejection', function (error) {
// eslint-disable-next-line no-console
  console.log(error.stack)
})

describe('The runner', function () {
  this.timeout(20000)

  setupTmpDir(sourceDir, {from: 'test/fixtures'})
  setupTmpDir(targetDir)

  beforeEach(async function () {
    fs.utimesSync(
      path.resolve(sourceDir, '0088_some_name_20161007-JQ3E6311.jpg'),
      new Date(),
      new Date('2016-10-07T15:15:15Z')
    )
    fs.utimesSync(
      path.resolve(sourceDir, '00000.MTS'),
      new Date(),
      new Date('2015-02-15T12:03:58')
    )
  })

  it('should put images and videos into a month-based dir-structure', async function () {
    await moveFile(
      path.resolve(sourceDir, '2003-04-23__15-49-58-img_0119.jpg'),
      path.resolve(targetDir, '2003/04/2003-04-23__15-49-58-img_0119.jpg')
    )

    // This file is already there
    const targetFileChecks = []
    await new Runner(sourceDir, targetDir)
      .on('targetFileCheck', (source, target, targetFileCheck) => targetFileChecks.push({
        source,
        target,
        targetFileCheck
      }))
      .run()

    await verifyTargetFiles()
    expect(targetFileChecks).to.deep.equal([
      {
        'source': 'tmp/runner/source/img_0119.jpg',
        'target': 'tmp/runner/target/2003/04/2003-04-23__15-49-58-img_0119.jpg',
        'targetFileCheck': {
          'exists': true,
          'choice': 'source',
          'samePixels': true,
          'sourceTags': {
            'IPTC:Keywords': 'Ereignisse/Kanada'
          },
          'targetTags': {}
        }
      },
      {
        'source': 'tmp/runner/source/2015-08-19_P1010301.JPG',
        'target': 'tmp/runner/target/2015/08/2015-08-19__11-39-04-p1010301.jpg',
        'targetFileCheck': {
          'sourceTags': {},
          'targetTags': {},
          'exists': true,
          'choice': 'source',
          'samePixels': true
        }
      }
    ])
  })

  it('should move the source-image to "obsolete", if the target image exists and is better', async function () {
    await moveFile(
      // Move better source image to target pior to running the runner
      path.resolve(sourceDir, 'img_0119.jpg'),
      path.resolve(targetDir, '2003/04/2003-04-23__15-49-58-img_0119.jpg')
    )

    // This file is already there
    const targetFileChecks = []
    await new Runner(sourceDir, targetDir)
      .on('targetFileCheck', (source, target, targetFileCheck) => targetFileChecks.push({
        source,
        target,
        targetFileCheck
      }))
      .run()

    await verifyTargetFiles()
    expect(targetFileChecks).to.deep.equal([
      {
        'source': 'tmp/runner/source/2015-08-19_P1010301.JPG',
        'target': 'tmp/runner/target/2015/08/2015-08-19__11-39-04-p1010301.jpg',
        'targetFileCheck': {
          'sourceTags': {},
          'targetTags': {},
          'exists': true,
          'choice': 'source',
          'samePixels': true
        }
      },
      {
        'source': 'tmp/runner/source/2003-04-23__15-49-58-img_0119.jpg',
        'target': 'tmp/runner/target/2003/04/2003-04-23__15-49-58-img_0119.jpg',
        'targetFileCheck': {
          'exists': true,
          'choice': 'target',
          'samePixels': true,
          'sourceTags': {},
          'targetTags': {
            'IPTC:Keywords': 'Ereignisse/Kanada'
          }
        }
      }
    ])
  })
})

async function verifyTargetFiles () {
  let files = await listFiles(targetDir)
  files.sort()
  expect(files).to.deep.equal([
    'tmp/runner/target/2003/04/2003-04-23__15-49-58-canon-powershot-a70.jpg',
    'tmp/runner/target/2003/04/2003-04-23__15-49-58-img_0119.jpg',
    'tmp/runner/target/2003/04/2003-04-23__15-49-58-img_0119.jpg.obsolete',
    'tmp/runner/target/2007/10/2007-10-01__12-00-00-bild137.jpg',
    'tmp/runner/target/2008/09/2008-09-08__03-24-35-p9080161.jpg',
    'tmp/runner/target/2008/09/2008-09-08__04-14-53-p9080175.avi',
    'tmp/runner/target/2015/02/2015-02-15__12-03-58-00000.mts',
    'tmp/runner/target/2015/08/2015-08-19__11-39-04-003.jpg',
    'tmp/runner/target/2015/08/2015-08-19__11-39-04-198.jpg',
    'tmp/runner/target/2015/08/2015-08-19__11-39-04-p1010301.jpg',
    'tmp/runner/target/2015/08/2015-08-19__11-39-04-p1010301.jpg.obsolete',
    'tmp/runner/target/2015/08/2015-08-19__11-39-04-p2.jpg',
    'tmp/runner/target/2015/08/2015-08-19__11-39-04-p8020152.jpg',
    'tmp/runner/target/2016/04/2016-04-01__20-23-43-gt-i8190-1.jpg',
    'tmp/runner/target/2016/04/2016-04-01__20-23-43-gt-i8190.jpg',
    'tmp/runner/target/2016/08/2016-08-02__11-00-53-p1050073.jpg',
    'tmp/runner/target/2016/10/2016-10-07__17-15-15-0088-some_name-jq3e6311.jpg',
    'tmp/runner/target/2017/07/2017-07-27__12-28-35-some-video.mp4',
    'tmp/runner/target/2017/07/2017-07-27__14-28-29-vid.mp4'
  ])

  // The file "img_0119.jpg" should have been copied
  expect(await hasha.fromFile(path.resolve(targetDir, '2003/04/2003-04-23__15-49-58-img_0119.jpg')))
    .to.deep.equal(await hasha.fromFile('test/fixtures/img_0119.jpg'))

}
