const debug = require('debug')('@gachou/group-by-date:rename-strategy')
const path = require('path')

const strategies = [
  ...require('./strategies/file-name-pattern'),
  require('./strategies/meta-tags'),
  require('./strategies/presorted')
]

module.exports = async function (file) {
  let targetPath = null
  // Try all strategy and use the first truthy value as file data
  for (let i = 0; i < strategies.length; i++) {
    targetPath = await strategies[i](file)
    if (targetPath) {
      break
    }
  }
  if (!targetPath) {
    throw new Error('No strategy found for file ' + file.path)
  }
  const t = targetPath
  debug(`${file} resolves to ${JSON.stringify(t)}`)
  return path.join(t.year, t.month, `${t.year}-${t.month}-${t.day}__${t.hour}-${t.minute}-${t.second}-${t.remainder}.${t.ext}`.toLowerCase())
}
