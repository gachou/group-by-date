/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect
// chai.use(require('dirty-chai'))

const path = require('path')
const copy = require('copy-concurrently')
const pify = require('pify')
const mkdirp = pify(require('mkdirp'))
const rimraf = pify(require('rimraf'))

const exiftool = require('../lib/exiftool')

const tmpDir = path.join('tmp', 'exiftool')

describe('The exiftool', function () {
  beforeEach(async function () {
    await rimraf(tmpDir)
    await mkdirp(path.dirname(tmpDir))
    await copy('test/fixtures', tmpDir)
  })

  it('should load all tags from a file, outputting ISO-Dates for date properties', async function () {
    expect(await exiftool.load(path.join(tmpDir, 'IMG_20160401_202342.jpg'), {tags: ['Composite:*', 'EXIF:*']})).to.deep.equal({
      'Composite:Aperture': 2.6,
      'Composite:FocalLength35efl': '3.5 mm',
      'Composite:ImageSize': '2560x1920',
      'Composite:Megapixels': 4.9,
      'Composite:OtherImage': '(Binary data 25769 bytes, use -b option to extract)',
      'Composite:ShutterSpeed': '1/99',
      'EXIF:ColorSpace': 'sRGB',
      'EXIF:ComponentsConfiguration': 'Err (206), R, -, -',
      'EXIF:CreateDate': '2016-04-01T20:23:43+0200',
      'EXIF:CustomRendered': 'Normal',
      'EXIF:DateTimeOriginal': '2016-04-01T20:23:43+0200',
      'EXIF:ExifVersion': '220 0 0 0',
      'EXIF:ExposureCompensation': 0,
      'EXIF:ExposureMode': 'Auto',
      'EXIF:ExposureTime': '1/99',
      'EXIF:FNumber': 2.6,
      'EXIF:Flash': 'Fired',
      'EXIF:FocalLength': '3.5 mm',
      'EXIF:GPSImgDirection': 232,
      'EXIF:GPSImgDirectionRef': 'Magnetic North',
      'EXIF:ImageHeight': 1920,
      'EXIF:ImageWidth': 2560,
      'EXIF:Make': 'SAMSUNG',
      'EXIF:MaxApertureValue': 2.6,
      'EXIF:MeteringMode': 'Center-weighted average',
      'EXIF:Model': 'GT-I8190',
      'EXIF:ModifyDate': '1970-01-01T01:00:00+0100',
      'EXIF:Orientation': 'Rotate 90 CW',
      'EXIF:OtherImageLength': 25769,
      'EXIF:OtherImageStart': 612,
      'EXIF:ResolutionUnit': 'inches',
      'EXIF:SceneCaptureType': 'Standard',
      'EXIF:Software': '8ecdff93bd',
      'EXIF:UserComment': 'User comments\u0000',
      'EXIF:WhiteBalance': 'Auto',
      'EXIF:XResolution': 72,
      'EXIF:YCbCrPositioning': 'Co-sited',
      'EXIF:YResolution': 72,
      'SourceFile': 'tmp/exiftool/IMG_20160401_202342.jpg'
    })
  })

  it('should repair exif tags in a file', async function () {
    let file = path.join(tmpDir, 'IMG_20160401_202342.jpg')
    await exiftool.repair(file)
    expect(await exiftool.load(file, {tags: ['Composite:*']})).to.deep.equal({
      'Composite:Aperture': 2.6,
      'Composite:FocalLength35efl': '3.5 mm',
      'Composite:ImageSize': '2560x1920',
      'Composite:Megapixels': 4.9,
      'Composite:ShutterSpeed': '1/99',
      'SourceFile': 'tmp/exiftool/IMG_20160401_202342.jpg'
    })
  })

  it('should save tags to a file, accepting ISO-Dates for date properties', async function () {
    let file = path.join(tmpDir, 'IMG_20160401_202342.jpg')
    await exiftool.repair(file)
    await exiftool.save(file, {
      'EXIF:DateTimeOriginal': '2015-01-01T00:00:30+0100'
    })
    expect(await exiftool.load(file, {tags: ['EXIF:DateTimeOriginal']})).to.deep.equal({
      'EXIF:DateTimeOriginal': '2015-01-01T00:00:30+0100',
      'SourceFile': 'tmp/exiftool/IMG_20160401_202342.jpg'
    })
  })

  it('it should use cached results if possible, but reset the cache if a file was saved', async function () {
    this.timeout(10000) // strict timeout that will be failed without cache
    let file = path.join(tmpDir, 'IMG_20160401_202342.jpg')
    for (let i = 0; i < 100; i++) {
      let tags = await exiftool.load(file)
      expect(tags['EXIF:DateTimeOriginal']).to.equal('2016-04-01T20:23:43+0200')
    }

    // Saving should invalidate the cache immediately
    await exiftool.repair(file)
    await exiftool.save(file, {'EXIF:DateTimeOriginal': '2015-01-01T00:00:30+0100'})

    for (let i = 0; i < 100; i++) {
      let tags = await exiftool.load(file)
      expect(tags['EXIF:DateTimeOriginal']).to.equal('2015-01-01T00:00:30+0100')
    }

  })

})
