/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect
// chai.use(require('dirty-chai'))

const checkTargetImage = require('../lib/checkTargetImage')

describe('The checkTargetImage function', function () {
  this.timeout(10000)

  it('should return { exists: false } if the target file does not exist', async function () {
    expect(await checkTargetImage(
      'test/fixtures/2015-08-19_P1010301.JPG',
      'non-existing-file.jpg'
    )).to.deep.equal({exists: false})
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

  it('should return { exists: true, diff: [], samePixels: true } for identical images (including tags)', async function () {
    expect(await checkTargetImage(
      'test/fixtures/2015-08-19_P1010301.JPG',
      'test/fixtures/2015_08_19_198.JPG'
    )).to.deep.equal({exists: true, diff: [], samePixels: true})
  })
})
