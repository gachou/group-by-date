const path = require('path')
const exiftool = require('../exiftool')

module.exports = [
  factory(
    'pattern 2015-08-20_P1010388.JPG',
    /(\d{4})-(\d{2})-(\d{2})__(\d{2})-(\d{2})-(\d{2})-(\w*)\.(\w*)$/,
    async function (file, match, year, month, day, hour, minute, second, remainder, ext) {
      return {year, month, day, hour, minute, second, remainder, ext}
    }
  ),
  factory(
    'pattern IMG_20170729_165743.jpg',
    /IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.(\w*)$/,
    async function (file, match, year, month, day, hour, minute, second, ext) {
      const exifdata = await exiftool.load(file)
      const remainder = robustPath(exifdata['EXIF:Model']) || 'wx'
      return {year, month, day, hour, minute, second, remainder, ext}
    }
  )
]

/**
 * Matcher that uses a regex and a transformer that transforms the match-array into
 * a `{year, month, day, hour, minute, second, remainder, ext, strategyName}`-object
 */
function factory (name, regex, transformer) {
  return async function filenamePattern (sourceDir, file) {
    let match = path.basename(file.path).match(regex)
    if (match) {
      return {
        strategyName: name,
        ...await transformer.apply(this, [path.join(sourceDir, file.path)].concat(match))
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
