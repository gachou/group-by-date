const crawl = require('../lib/crawl')
const path = require('path')
const moveFile = require('move-file')
const debug = require('debug')('@gachou/group-by-date:runner')

const renameStrategy = require('./rename-strategy')

/**
 * Move all image and video files into a month-grouped directory structure
 * @param {string} sourceDir
 * @param {string} targetDir
 * @param {object=} options
 * @param {boolean} options.dryRun
 */
module.exports = async function (sourceDir, targetDir, options) {
  const _options = {
    dryRun: false,
    ...options
  }

  const copiedFiles = {}

  return new Promise((resolve, reject) => {
    crawl(sourceDir, async function (file) {
      process.stdout.write('.')
      if (file.stat.isFile() && path.extname(file.path).match(/jpg|mp4|avi|m2t|mpg/i)) {
        try {
          debug('Running ', file.fullPath)
          let sourcePath = file.fullPath
          let targetPath = await renameStrategy(file)
          let absTargetPath = path.resolve(targetDir, targetPath)
          if (copiedFiles[absTargetPath]) {
            console.log(`${absTargetPath} already exists as copy of ${copiedFiles[absTargetPath]} (and now ${sourcePath})`)
            return true
          }
          copiedFiles[targetPath] = sourcePath
          return _options.dryRun
            ? `${sourcePath} -> ${absTargetPath}\n`
            : moveFile(sourcePath, absTargetPath, {overwrite: false})
        } catch (e) {
          console.error('Error while handling ' + file.path, e)
        } finally {
          process.stdout.write(':')
          debug('Done ', file.fullPath)
        }
      }
    }, 5)
      .on('error', (err) => console.log(err))
      .on('end', () => resolve())
      .pipe(process.stdout)
  })
}
