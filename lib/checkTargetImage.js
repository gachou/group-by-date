const pify = require('pify')
const access = pify(require('fs').access)
const exiftool = require('./exiftool')
const just = require('just-diff')
const pixelCompare = require('pixel-compare')

/**
 * Returns a false promise, if there is the target image and it does not match the
 * source image.
 *
 * @param {string} source the source image (full path)
 * @param {string} target the target image (full path)
 *
 * @return {Promise<boolean>}
 *
 */
module.exports = async function checkTargetImage (source, target) {
  // If the file does not exist, return true
  let fileExists = await access(target).then(() => true, () => false)
  if (!fileExists) {
    return {
      exists: false
    }
  }

  let sourceTags = relevantTags(await exiftool.load(source))
  let targetTags = relevantTags(await exiftool.load(target))

  return {
    exists: true,
    diff: just.diff(sourceTags, targetTags),
    samePixels: await pixelCompare({baseImage: source, testImage: target}).then((value) => value, e => false)
  }
}

function relevantTags (tags) {
  return Object.keys(tags)
    .filter((tagName) => tagName !== 'SourceFile')
    .filter((tagName) => tagName !== 'File:FileInodeChangeDate')
    .filter((tagName) => tagName !== 'File:Directory')
    .filter((tagName) => tagName !== 'File:FileName')
    .reduce((sub, next) => {
      sub[next] = tags[next]
      return sub
    }, {})
}
