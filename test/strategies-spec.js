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
