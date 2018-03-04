/* eslint-env mocha */

// const chai = require('chai')
// const expect = chai.expect
// chai.use(require('dirty-chai'))

const path = require('path')
// const fs = require('fs')
const {setupTmpDir} = require('./lib/tmpDir')
const tmpDir = 'tmp/reporter'

const {EventEmitter} = require('events')
const {writeReportFor} = require('../lib/reporter')

process.on('unhandledRejection', function (error) {
// eslint-disable-next-line no-console
  console.log(error.stack)
})

describe('The reporter', function () {
  this.timeout(20000)

  setupTmpDir(tmpDir)

  beforeEach(async function () {
  })

  it('should write a report file', function () {
    const mockRunner = new EventEmitter()
    const reportFile = path.join(tmpDir, 'report.html')
    writeReportFor(reportFile, mockRunner)
    mockRunner.emit('skip', 'sourcefile.jpg', 'targetFile.jpg', {
      'exists': true,
      'choice': 'undecided',
      'samePixels': false,
      'sourceTags': {
        'IPTC:Keywords': 'Ereignisse/Theater/Ein toller Dreh 2006'
      },
      'targetTags': {}
    })
    mockRunner.emit('skip', 'sourcefile2.jpg', 'targetFile2.jpg', {
      'exists': true,
      'choice': 'undecided',
      'samePixels': false,
      'sourceTags': {
        'IPTC:Keywords': 'Ereignisse/Theater/Ein toller Dreh 2006'
      },
      'targetTags': {}
    })
    mockRunner.emit('done')
  })
})
