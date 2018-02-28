const path = require('path')
const moveFile = require('move-file')
const debug = require('debug')('@gachou/group-by-date:runner')
const checkTargetImage = require('./checkTargetImage')
const mapStream = require('map-stream-limit')
const dirTreeStream = require('directory-tree-stream')
const events = require('events')

const renameStrategy = require('./rename-strategy')

class Runner extends events.EventEmitter {
  /**
   * Create a runner hat moves all image and video files into a month-grouped directory structure
   * @param {string} sourceDir
   * @param {string} targetDir
   * @param {object=} options
   * @param {boolean} options.dryRun
   **/
  constructor (sourceDir, targetDir, options) {
    super()
    this.sourceDir = sourceDir
    this.targetDir = targetDir
    this.options = {
      dryRun: false,
      ...options
    }
  }

  /**
   *
   * @param {{path: string, stat: fs.Stats}} file
   * @returns {Promise.<{source: string, target: string}>}
   */
  async computeMoveCommand (file) {
    if (file.stat.isFile() && path.extname(file.path).match(/jpg|mp4|avi|m2t|mpg/i)) {
      const fileInfo = {
        fullPath: path.join(this.sourceDir, file.path),
        path: file.path,
        stat: file.stat
      }
      let relativeTargetPath = await renameStrategy(fileInfo)
      let targetPath = path.resolve(this.targetDir, relativeTargetPath)
      // Move command
      this.emit('moveCommand', fileInfo.path, relativeTargetPath)
      return {
        source: fileInfo.fullPath,
        target: targetPath
      }
    }
  }

  /**
   *
   * @param {string} source
   * @param {string} target
   * @returns {Promise.<void>}
   */
  async moveFile (source, target) {
    let targetFileCheck = await checkTargetImage(source, target)
    if (targetFileCheck.exists) {
      this.emit('targetFileCheck', source, target, targetFileCheck)
      return
    }
    if (this.options.dryRun) {
      this.emit('moveFile', source, target)
    } else {
      await moveFile(source, target, {overwrite: false})
    }
  }

  /**
   * Run the grouping operation
   * @returns {Promise.<void>}
   */
  async run () {
    return new Promise((resolve, reject) => {
      dirTreeStream(this.sourceDir)
        .pipe(map(async (file) => this.computeMoveCommand(file).catch((err) => this.emit('warn', err)), 5))
        .pipe(map(async ({source, target}) => this.moveFile(source, target).catch((err) => this.emit('warn', err)), 1))
        .on('data', (data) => debug(data))
        .on('end', () => resolve())
    })
  }
}

/**
 * Wrapper for "map-stream-limit" to work with promise base functions
 * @param {function(*):Promise<*>} fn a function mapping an input value to the promise for an output
 * @param concurrency
 * @returns {stream}
 */
function map (fn, concurrency) {
  let wrapper = (input, cb) => fn(input).then((output) => cb(null, output), (err) => cb(err))
  return mapStream(wrapper, concurrency)
}

module.exports = {
  Runner
}
