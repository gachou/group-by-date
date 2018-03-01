const pify = require('pify')
const access = pify(require('fs').access)
const exiftool = require('./exiftool')
const just = require('just-diff')
const pixelCompare = require('pixel-compare')
const deepEqual = require('deep-equal')

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
  // see if there are any date tags apart from the file date (in both files)
  // if there are not, then the FileModifyDate is relevant as well
  let sourceDate = await exiftool.creationDate(source)
  let targetDate = await exiftool.creationDate(target)
  let includeFileDate = sourceDate == null && targetDate == null

  let sourceTags = relevantTags(await exiftool.load(source), {includeFileDate})
  let targetTags = relevantTags(await exiftool.load(target), {includeFileDate})

  let samePixels = await pixelCompare({baseImage: source, testImage: target}).then((value) => value, e => false)
  let diff = just.diff(sourceTags, targetTags)
  let overwrite = samePixels && betterTags(diff)

  return {
    exists: true,
    overwrite,
    samePixels,
    diff
  }
}

/**
 * Compute relevant tags for comparing two files
 * @param tags
 * @param options
 * @returns {*}
 */
function relevantTags (tags, options) {
  return Object.keys(tags)
    .filter((tagName) => {
    // Include FileModifyDate if needed
      if (options.includeFileDate && tagName === 'File:FileModifyDate') {
        return true
      }
      // Exclude all other FileTags and the SourceFile
      if (tagName === 'SourceFile' || tagName.match(/File:.*/)) {
        return false
      }
      // Include everything else
      return true
    })
    .reduce((sub, next) => {
      sub[next] = tags[next]
      return sub
    }, {})
}

function betterTags (diff) {
  if (deepEqual(diff, [{'op': 'remove', 'path': ['IPTC:Keywords']}])) {
    return true
  }
  if (deepEqual(diff, [])) {
    return true
  }
  return false
}
