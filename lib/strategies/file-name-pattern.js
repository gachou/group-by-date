const path = require('path')
const exiftool = require('../exiftool')
const verifyDate = require('../verifyDate')

module.exports = [
  factory(
    'pattern 2015-08-20_13-02-59-some-text.JPG',
    /^(\d{4})-(\d{2})-(\d{2})__(\d{2})-(\d{2})-(\d{2})-([\w-_]*)\.(\w+)$/,
    async function (file, year, month, day, hour, minute, second, remainder, ext) {
      verifyDate(await exiftool.creationDate(file.fullPath), {year, month, day, hour, minute, second})
      return {year, month, day, hour, minute, second, remainder, ext}
    }
  ),
  factory(
    'pattern IMG_20170729_165743.jpg or 20170729_165743.jpg',
    /^(IMG_)?(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.(\w*)$/,
    async function (file, prefix, year, month, day, hour, minute, second, ext) {
      const exifData = await exiftool.load(file.fullPath)
      const remainder = robustPath(exifData['EXIF:Model']) || 'wx'
      let exifDate = await exiftool.creationDate(file.fullPath)
      verifyDate(exifDate, {year, month, day, hour, minute})
      return {year, month, day, hour, minute, second: exifDate.second, remainder, ext}
    }
  ),
  factory(
    'pattern IMG_20170729_165743_1.jpg or 20170729_165743_1.jpg',
    /^(IMG_)?(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})_(\w+)\.(\w*)$/,
    async function (file, prefix, year, month, day, hour, minute, second, remainderPart, ext) {
      const exifData = await exiftool.load(file.fullPath)
      const remainder = (robustPath(exifData['EXIF:Model']) || 'wx') + '-' + remainderPart
      let exifDate = await exiftool.creationDate(file.fullPath)
      verifyDate(exifDate, {year, month, day, hour, minute})
      return {year, month, day, hour, minute, second: exifDate.second, remainder, ext}
    }
  ),

  factory(
    'pattern VID_20170729_165743.mp4',
    /^VID_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.(\w+)$/,
    async function (file, year, month, day, hour, minute, second, ext) {
      return {year, month, day, hour, minute, second, remainder: 'vid', ext}
    }
  ),
  factory(
    'pattern 2015-08-19_P1010301.JPG',
    /^(\d{4})-(\d{2})-(\d{2})[-_]([A-Za-z]\w*)\.(\w*)$/,
    async function (file, year, month, date, remainder, ext) {
      let dateInfo = await exiftool.creationDate(file.fullPath)
      verifyDate(dateInfo, {year, month, date})
      return {...dateInfo, remainder: remainder, ext}
    }
  ),
  factory(
    'pattern 20150819 003.JPG',
    /^(\d{4})(\d{2})(\d{2}) (\w*)\.(\w+)$/,
    async function (file, year, month, day, remainder, ext) {
      let dateInfo = await exiftool.creationDate(file.fullPath)
      verifyDate(dateInfo, {year, month, day})
      return {...dateInfo, remainder: remainder, ext}
    }
  ),
  factory(
    'pattern 2015_08_19_198.JPG',
    /^(\d{4})_(\d{2})_(\d{2})_(\w*)\.(\w+)$/,
    async function (file, year, month, day, remainder, ext) {
      let dateInfo = await exiftool.creationDate(file.fullPath)
      verifyDate(dateInfo, {year, month, day})
      return {...dateInfo, remainder: remainder, ext}
    }
  ),
  factory(
    'pattern p8020152.JPG',
    /^(p\d{7})\.(\w+)$/i,
    async function (file, remainder, ext) {
      let dateInfo = await exiftool.creationDate(file.fullPath)
      return {...dateInfo, remainder: remainder, ext}
    }
  ),
  factory(
    'fotograf kita 0000_some_name_20161007-id.jpg',
    /(\d{4})_([\w_]+)_(\d{4})(\d{2})(\d{2})-(\w*)\.(jpg)$/i,
    async function (file, seq, name, year, month, day, id, ext) {
      let dateInfo = await exiftool.creationDate(file.fullPath, {useModificationDate: true})
      verifyDate(dateInfo, {year, month, day})
      return {...dateInfo, remainder: `${seq}-${name}-${id}`, ext}
    }
  )
]

/**
 * Matcher that uses a regex and a transformer that transforms the match-array into
 * a `{year, month, day, hour, minute, second, remainder, ext, strategyName}`-object
 */
function factory (name, regex, transformer) {
  return async function filenamePattern (file) {
    let match = path.basename(file.path).match(regex)
    if (match) {
      match[0] = file
      let filenameParts = await transformer.apply(this, match)
      if (filenameParts == null) {
        return null
      }
      return {
        strategyName: name,
        ...filenameParts
      }
    }
  }
}

/**
 * Remove characters from the name that are invalid as part of the a path
 * @param name
 */
function robustPath (name) {
  if (name) {
    return name.replace(/[^\w\d-_.]/g, '-').toLowerCase()
  }
}
