const pify = require('pify')
const access = pify(require('fs').access)
const exiftool = require('./exiftool')
const pixelCompare = require('pixel-compare')
const deepEqual = require('deep-equal')
const compareObject = require('./compareObject')

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

  let [sourceTags, targetTags] = compareObject(
    relevantTags(await exiftool.load(source), {includeFileDate}),
    relevantTags(await exiftool.load(target), {includeFileDate})
  )

  let samePixels = await pixelCompare({baseImage: source, testImage: target}).then((value) => value, e => false)
  let overwrite = samePixels && betterTags(sourceTags, targetTags)

  return {
    exists: true,
    overwrite,
    samePixels,
    sourceTags,
    targetTags
  }
}

const irrelevantTags = [
  'SourceFile',
  /File:.*/,
  'EXIF:Software',
  'EXIF:ThumbnailOffset'
]

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
      for (let i = 0; i < irrelevantTags.length; i++) {
        let excludeTag = irrelevantTags[i]
        // Compare (regex match or string compare)
        // Exclude all tags described about (irrelevantTags)
        if (excludeTag instanceof RegExp ? tagName.match(excludeTag) : tagName === excludeTag) {
          return false
        }
      }
      // Include everything else
      return true
    })
    .reduce((sub, next) => {
      sub[next] = tags[next]
      return sub
    }, {})
}

function betterTags (sourceTags, targetTags) {
  // If the target file has nothing more than the source file, we should probably replace it.
  if (deepEqual(targetTags, {})) {
    return true
  }
  return false
}
