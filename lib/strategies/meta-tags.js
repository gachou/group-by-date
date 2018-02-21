const exiftool = require('../exiftool')
const path = require('path')

module.exports = async function metaTags (file) {
  const metaTags = await exiftool.creationDate(file.fullPath)
  if (metaTags) {
    let ext = path.extname(file.path)
    const baseName = path.basename(file.path, ext)
    return {
      strategyName: 'meta-tags',
      remainder: baseName,
      ext: ext.slice(1),
      ...await metaTags
    }
  }
}
