/* eslint-disable no-console */
const {Runner} = require('./runner')

const argv = require('yargs')
  .usage(
    '$0 <sourceDir> <targetDir>',
    'Move images and videos into a directory structure grouped by month',
    (yargs) => {
      yargs.positional('sourceDir', {
        describe: 'The directory containing the source files',
        type: 'string'
      })
      yargs.positional('targetDir', {
        describe: 'The directory containing the groups output files',
        type: 'string'
      })
    })
  .option('dry-run', {
    alias: 'd',
    describe: 'Do not actually copy anything, just print what would be done'
  })
  .argv

new Runner(argv.sourceDir, argv.targetDir, {dryRun: argv['dry-run']})
  .on('moveFile', (source, target) => console.log('move', source, target))
  .on('targetFileCheck', (source, target, targetFileCheck) => console.log('targetFileCheck', JSON.stringify({
    source,
    target,
    targetFileCheck
  }, 0, 2)))
  .run()
  .then(console.log, console.error)
