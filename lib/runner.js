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
      if (file.stat.isFile()) {
        let sourcePath = path.join(sourceDir, file.path)
        let targetPath = await renameStrategy(sourceDir, file)
        let absTargetPath = path.resolve(targetDir, targetPath)
        if (copiedFiles[absTargetPath]) {
          debug(`${absTargetPath} already exists as copy of ${copiedFiles[absTargetPath]} (and now ${sourcePath})`)
          return true
        }
        copiedFiles[targetPath] = sourcePath
        if (_options.dryRun) {
          return console.log(`${sourcePath} -> ${absTargetPath}`)
        } else {
          return moveFile(sourcePath, absTargetPath, {overwrite: false})
        }
      }
    }, 5)
      .on('error', (err) => console.log(err))
      .on('end', () => resolve())
      .pipe(process.stdout)

  })
}
