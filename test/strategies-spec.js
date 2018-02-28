/* eslint-env mocha */

const fs = require('fs')
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
// chai.use(require('dirty-chai'))

const renamer = require('../lib/rename-strategy')

describe('The rename strategies', function () {
  /**
   * @type {fs.Stats}
   */
  let bild137Stats = fs.statSync('test/fixtures/sorted/2007/10/01/Bild137.jpg')

  afterEach(function () {
    fs.utimesSync('test/fixtures/sorted/2007/10/01/Bild137.jpg', bild137Stats.atime, bild137Stats.mtime)
    require('../lib/exiftool').clearCache()
  })

  it('should rename images like yyyy-mm-dd__hh-mm-yy-...', async function () {
    expect(await renamer(file('test/fixtures/2016-08-02__11-00-53-p1050073.jpg')))
      .to.equal('2016/08/2016-08-02__11-00-53-p1050073.jpg')
  })

  it('should rename images like IMG_yyyymmdd_hhmmyy.jpg', async function () {
    expect(await renamer(file('test/fixtures/IMG_20160401_202342.jpg')))
      .to.equal('2016/04/2016-04-01__20-23-43-gt-i8190.jpg')
  })

  it('should rename images like yyyy-mm-dd_abc.jpg', async function () {
    expect(await renamer(file('test/fixtures/2015-08-19_P1010301.JPG')))
      .to.equal('2015/08/2015-08-19__11-39-04-p1010301.jpg')
  })

  it('should rename images like yyyymmdd abc.jpg', async function () {
    expect(await renamer(file('test/fixtures/20150819 003.JPG')))
      .to.equal('2015/08/2015-08-19__11-39-04-003.jpg')
  })

  it('should rename images like yyyy_mm_dd_abc.jpg', async function () {
    expect(await renamer(file('test/fixtures/2015_08_19_198.JPG')))
      .to.equal('2015/08/2015-08-19__11-39-04-198.jpg')
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

  it('should rename kita photgraphers-images', async function () {
    expect(await renamer(file('test/fixtures/0088_some_name_20161007-JQ3E6311.jpg')))
      .to.equal('2016/10/2016-10-07__15-15-00-0088-some_name-jq3e6311.jpg')
  })

  it('should not rename files that still contain the year in the remainder', async function () {
    try {
      await renamer(file('test/fixtures/p2008-invalid.avi'))
      assert.fail('Must throw exception')
    } catch (e) {
      expect(e.message).to.equal('test/fixtures/p2008-invalid.avi contains year 2008 in remainder p2008-invalid.\n' +
        '         Should there be a file-name-pattern? Extracted date: {"year":"2008","month":"09","day":"08","hour":"04","minute":"14","second":"53"}')
    }
  })

  it('should rename p8020152.JPG even if 2015 is contained in the remainder', async function () {
    expect(await renamer(file('test/fixtures/p8020152.JPG')))
      .to.equal('2015/08/2015-08-19__11-39-04-p8020152.jpg')
  })

  it('should rename 2007/10/01/Bild137.JPG to an approximated time (about noon, file date does not match parent dirs)', async function () {
    fs.utimesSync('test/fixtures/sorted/2007/10/01/Bild137.jpg', new Date('2010-05-05T17:00:00Z'), new Date('2010-05-05T17:00:00Z'))
    expect(await renamer(file('test/fixtures/sorted/2007/10/01/Bild137.jpg')))
      .to.equal('2007/10/2007-10-01__12-00-00-bild137.jpg')
  })

  it('should rename 2007/10/01/Bild137.JPG to an exact time (if the file date is matching the path)', async function () {
    fs.utimesSync('test/fixtures/sorted/2007/10/01/Bild137.jpg', new Date('2007-10-01T04:00:00'), new Date('2007-10-01T08:00:00'))
    require('../lib/exiftool').clearCache()
    expect(await renamer(file('test/fixtures/sorted/2007/10/01/Bild137.jpg')))
      .to.equal('2007/10/2007-10-01__08-00-00-bild137.jpg')
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
