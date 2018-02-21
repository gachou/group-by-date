/* eslint-env mocha */

const fs = require('fs')
const chai = require('chai')
const expect = chai.expect
// chai.use(require('dirty-chai'))

const renamer = require('../lib/rename-strategy')

describe('The rename strategies', function () {
  it('should rename images like yyyy-mm-dd__hh-mm-yy-...', async function () {
    expect(await renamer(file('test/fixtures/2016-08-02__11-00-53-p1050073.jpg')))
      .to.equal('2016/08/2016-08-02__11-00-53-p1050073.jpg')
  })

  it('should rename images like IMG_yyyymmdd_hhmmyy.jpg', async function () {
    expect(await renamer(file('test/fixtures/IMG_20160401_202342.jpg')))
      .to.equal('2016/04/2016-04-01__20-23-42-gt-i8190.jpg')
  })

  it('should rename images like yyyy-mm-dd_abc.jpg', async function () {
    expect(await renamer(file('test/fixtures/2015-08-19_P1010301.JPG')))
      .to.equal('2015/08/2015-08-19__11-39-04-p1010301.jpg')
  })

  it('should rename images like yyyymmdd abc.jpg', async function () {
    expect(await renamer(file('test/fixtures/20150819 003.JPG')))
      .to.equal('2015/08/2015-08-19__11-39-04-003.jpg')
  })

  it('should rename videos like VID_yyyymmdd_hhmmss.mp4', async function () {
    expect(await renamer(file('test/fixtures/20150819 003.JPG')))
      .to.equal('2015/08/2015-08-19__11-39-04-003.jpg')
  })

  it('should rename mp4-videos based on their quicktime creation tag', async function () {
    expect(await renamer(file('test/fixtures/some-video.mp4')))
      .to.equal('2017/07/2017-07-27__12-28-35-some-video.mp4')
  })

  it('should rename jpg-image based on their exif-DateTimeOriginal tag', async function () {
    expect(await renamer(file('test/fixtures/p9080161.jpg')))
      .to.equal('2008/09/2008-09-08__03-24-35-p9080161.jpg')
  })

  it('should rename avi-videos based on their riff  tag', async function () {
    expect(await renamer(file('test/fixtures/p9080175.avi')))
      .to.equal('2008/09/2008-09-08__04-14-53-p9080175.avi')
  })

})

/**
 * Helper function for creating the same file-object as the dir-stream
 * @param {string} aPath
 * @returns {{path: string, stat: fs.Stats, fullPath: string}}
 */
function file (aPath) {
  return {
    path: aPath,
    fullPath: aPath,
    stat: fs.statSync(aPath)
  }
}
