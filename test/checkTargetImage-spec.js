/* eslint-env mocha */

const path = require('path')
const fs = require('fs')

const chai = require('chai')
const expect = chai.expect
// chai.use(require('dirty-chai'))

const {setupTmpDir} = require('./lib/tmpDir')
const copy = require('copy-concurrently')
const checkTargetImage = require('../lib/checkTargetImage')

const tmpDir = path.join('tmp', 'check-target-image')

// Tests
describe('The checkTargetImage function', function () {
  setupTmpDir(tmpDir)

  this.timeout(10000)

  it('should return { exists: false } if the target file does not exist', async function () {
    expect(await checkTargetImage(
      'test/fixtures/2015-08-19_P1010301.JPG',
      'non-existing-file.jpg'
    )).to.deep.equal({exists: false, choice: 'source'})
  })

  it('should show a list of tag-differences if there are any. Should whould if the image data is equal', async function () {
    let checkResult = await checkTargetImage(
      'test/fixtures/2015-08-19_P1010301.JPG',
      'test/fixtures/2016-08-02__11-00-53-p1050073.jpg'
    )
    expect(checkResult.diff, 'Checking tag diff').not.to.deep.equal([])
    expect(checkResult.exists, 'Checking exists').to.equal(true)
    expect(checkResult.samePixels, 'Checking image diff').to.equal(false)
  })

  it('should return { exists: true, diff: [], overwrite: true, samePixels: true } for identical images (including tags)', async function () {
    expect(await checkTargetImage(
      'test/fixtures/2015-08-19_P1010301.JPG',
      'test/fixtures/2015_08_19_198.JPG'
    )).to.deep.equal({exists: true, 'sourceTags': {}, 'targetTags': {}, samePixels: true, choice: 'source'})
  })

  it('should include the FileModifyDate in the relevant tags, if no other creation date can be found', async function () {
    // An image without tags..., copy it and modify the date to get a real change
    let original = 'test/fixtures/sorted/2007/10/01/Bild137.jpg'
    let tmpFile = path.resolve(tmpDir, 'Bild137-a.jpg')
    await copy(original, tmpFile)
    fs.utimesSync(tmpFile, new Date('2020-08-08T08:08:08Z'), new Date('2020-08-08T08:08:08Z'))

    expect(await checkTargetImage(
      original,
      tmpFile
    )).to.deep.equal({
      'sourceTags': {
        'File:FileModifyDate': '2010-06-01T20:15:14+0200'
      },
      'targetTags': {
        'File:FileModifyDate': '2020-08-08T10:08:08+0200'
      },
      'exists': true,
      'choice': 'undecided',
      'samePixels': true
    })
  })
})
