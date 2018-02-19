const dirTreeStream = require('directory-tree-stream')
const map = require('map-stream-limit')
const path = require('path')

/**
 * Iterates a file folder and calls the iteratee for each file.
 * Limits the number of parallel invocations. The iteratee must
 * return a promise that resolves or rejects once the task has
 * finished.
 *
 * @param {string} directory path to a directory to traverse
 * @param {function({path:string, stats:Stats, fullPath:string}):Promise<any>} iteratee a function to be
 *   called with the path of each file.
 * @return a stream
 * @param concurrency
 */
module.exports = function crawl (directory, iteratee, concurrency) {
  const dirStream = dirTreeStream(directory)
  const result = dirStream.pipe(map((file, cb) => {
    const fileInfo = {
      fullPath: path.join(directory, file.path),
      path: file.path,
      stat: file.stat
    }
    return Promise.resolve(iteratee(fileInfo)).then(
      (result) => cb(null, result),
      (err) => cb(err)
    )
  }, concurrency))

  // Forward errors
  dirStream.on('error', (err) => result.emit('error', err))

  return result
}
