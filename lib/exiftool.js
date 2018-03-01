const debug = require('debug')('group-by-date:exiftool')
const cp = require('child_process')
const mem = require('mem')

module.exports = {
  load,
  save,
  repair,
  creationDate,
  clearCache
}

/**
 *
 * @param {string} file the path to the file to extract the tags from
 * @param {object=} options
 * @param {string[]=} options.tags tags or tag groups to extract (e.g. Composite, EXIF:*)
 * @returns {Promise.<object>}
 */
async function load (file, options) {
  const _options = Object.assign({
    tags: []
  }, options)

  const output = await cachedRunExifTool([
    '-G',
    '-json',
    '-struct',
    '-dateFormat',
    '%Y-%m-%dT%H:%M:%S%z',
    ..._options.tags.map(tag => `-${tag}`),
    file
  ])
  return JSON.parse(output)[0]
}

function clearCache () {
  mem.clear(cachedRunExifTool)
}

async function save (file, tags) {
  const input = {
    'SourceFile': file,
    ...tags
  }
  let stdin = JSON.stringify(input)
  clearCache()
  await runExifTool([
    '-G', '-json=-', '-overwrite_original',
    '-dateFormat', '%Y-%m-%dT%H:%M:%S%z', file
  ], stdin)
  clearCache()
}

/**
 * Delete and rewrite the whole exif header
 * See http://owl.phy.queensu.ca/~phil/exiftool/faq.html#Q20 for details
 * @param file
 * @returns {Promise.<void>}
 */
async function repair (file) {
  await runExifTool(['-all=', '-tagsfromfile', '@', '-all:all', '-unsafe', '-icc_profile', file])
  mem.clear(cachedRunExifTool)
}

/**
 * Return an object containing the time components, either from the EXIF date or from the stats
 * @param {string} file
 * @param {object=} options
 * @param {boolean} options.useModificationDate whether or not to use the file's modification date as fallback if no other tags exist
 * @return {Promise.<{year:string, month:string, day:string, hour:string, minute:string ,second:string}|null>}
 */
async function creationDate (file, options) {
  options = Object.assign({useModificationDate: false}, options)

  const exifdata = await load(file)
  const dateTags = [
    'EXIF:DateTimeOriginal',
    'QuickTime:CreateDate',
    'RIFF:DateTimeOriginal'
  ]
  if (options.useModificationDate) {
    dateTags.push('File:FileModifyDate')
  }
  for (let i = 0; i < dateTags.length; i++) {
    let isoDate = exifdata[dateTags[i]]
    if (isoDate) {
      return splitDate(new Date(isoDate))
    }
  }
  return null
}

/**
 * Return an object containing the time components, either from the EXIF date or from the stats
 * @param {Date} date
 * @return {{year:string, month:string, day:string, hour:string, minute:string ,second:string}}
 */
function splitDate (date) {
  return {
    year: pad(date.getFullYear(), 4),
    month: pad(date.getMonth() + 1),
    day: pad(date.getDate()),
    hour: pad(date.getHours()),
    minute: pad(date.getMinutes()),
    second: pad(date.getSeconds())
  }
}

/**
 * Fill number with zeros (default: two digits)
 */
function pad (n, length = 2) {
  return ('0000' + n).substr(-length)
}

/**
 * Execute exif-tool
 * @param args arguments passed to exif-tool
 * @param {string=} stdin optional string to be passed to stdin
 * @return {Promise<string>}
 */
function runExifTool (args, stdin) {
  return new Promise((resolve, reject) => {
    let child = cp.execFile('exiftool', args, function (err, stdout, stderr) {
      debug('stdin', stdin)
      debug('stdout', stdout)
      debug('stderr', stderr)
      if (err) {
        return reject(err)
      }
      resolve(stdout)
    })
    if (stdin) {
      // Pipe tags into the exiftool child process
      child.stdin.end(stdin)
    }
  })
}

/**
 * Cached version of "runExifTool".
 */
const cachedRunExifTool = mem(runExifTool, {maxAge: 20000})
