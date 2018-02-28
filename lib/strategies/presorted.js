const exiftool = require('../exiftool')
const verifyDate = require('../verifyDate')

module.exports = async function (file) {
  let match = file.fullPath.match(/(\d{4})\/(\d{2})\/(\d{2})\/(.*?)\.(.*?)$/)
  if (match) {
    let [, year, month, day, remainder, ext] = match
    const pathParts = {year, month, day}
    const exifDate = await exiftool.creationDate(file.fullPath, {useModificationDate: true})
    try {
      verifyDate(exifDate, pathParts)
      return {
        strategyName: 'presorted yyyy/mm/dd/remainder.ext (verified)',
        ...exifDate,
        remainder,
        ext
      }
    } catch (e) {
      return {
        ...pathParts,
        hour: '12',
        minute: '00',
        second: '00',
        remainder,
        ext
      }
    }
  }
}
