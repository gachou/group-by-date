const path = require('path')
const exiftool = require('../exiftool')

module.exports = [
  factory(
    'pattern 2015-08-20_P1010388.JPG',
    /(\d{4})-(\d{2})-(\d{2})__(\d{2})-(\d{2})-(\d{2})-(\w*)\.(\w*)$/,
    async function (file, year, month, day, hour, minute, second, remainder, ext) {
      return {year, month, day, hour, minute, second, remainder, ext}
    }
  ),
  factory(
    'pattern IMG_20170729_165743.jpg',
    /IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.(\w*)$/,
    async function (file, year, month, day, hour, minute, second, ext) {
      const exifdata = await exiftool.load(file.fullPath)
      const remainder = robustPath(exifdata['EXIF:Model']) || 'wx'
      return {year, month, day, hour, minute, second, remainder, ext}
    }
  ),
  factory(
    'pattern 2015-08-19_P1010301.JPG',
    /\d{4}-\d{2}-\d{2}_(\w*)\.(\w*)$/,
    async function (file, remainder, ext) {
      let dateInfo = await dateFromFile(file)
      return {...dateInfo, remainder: remainder.toLowerCase(), ext}
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
      return {
        strategyName: name,
        ...await transformer.apply(this, match)
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

/**
 * Return an object containing the time components, either from the EXIF date or from the stats
 * @param {{path: string, stats: Stats, fullpath: string}} file
 * @return {Promise.<{year, month, day,hours,minutes,seconds}>}
 */
async function dateFromFile (file) {
  const exifdata = await exiftool.load(file.fullPath)
  if (exifdata && exifdata['EXIF:DateTimeOriginal']) {
    return splitDate(new Date(exifdata['EXIF:DateTimeOriginal']))
  }
  return splitDate(file.stats.mtime)
}

function splitDate (date) {
  return {
    year: pad(date.getFullYear(), 4),
    month: pad(date.getMonth() + 1),
    day: pad(date.getDate()),
    hour: pad(date.getHours()),
    minute: pad(date.getMinutes()),
    second: pad(date.getSeconds())
  }
}

/**
 * Fill number with zeros (default: two digits)
 */
function pad (n, length = 2) {
  return ('0000' + n).substr(-length)
}