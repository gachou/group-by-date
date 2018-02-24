const exiftool = require('../exiftool')
const path = require('path')

module.exports = async function metaTags (file) {
  const metaTags = await exiftool.creationDate(file.fullPath)
  if (metaTags) {
    let ext = path.extname(file.path)
    const baseName = path.basename(file.path, ext)
    // Check if the year is included in the remainder. If yes, we might need to add file-name-pattern to avoid longer
    // than necessary target filenames.
    if (baseName.indexOf(metaTags.year) >= 0) {
      throw new Error(
        `${file.path} contains year ${metaTags.year} in remainder ${baseName}.
         Should there be a file-name-pattern? Extracted date: ${JSON.stringify(metaTags)}`
      )
    }

    return {
      strategyName: 'meta-tags',
      remainder: baseName,
      ext: ext.slice(1),
      ...await metaTags
    }
  }
}
