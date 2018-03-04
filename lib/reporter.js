const fs = require('fs')
const _ = {
  escape: require('lodash.escape')
}

function writeReportFor (targetFile, runner) {
  const stream = fs.createWriteStream(targetFile)

  runner.on('skip', function (source, target, check) {
    stream.write(`
<div class="skip">
<div>Source: ${_.escape(source)}</div>
<div>Target: ${_.escape(target)}</div>
<div class="images">
<a href="${encodeURI(source)}"><img width="400" src="${encodeURI(source)}"></a>
<a href="${encodeURI(target)}"><img width="400" src="${encodeURI(target)}"></a>
</div>
<pre class="tags">${_.escape(JSON.stringify(check, 0, 4))}</pre>
</div>
<hr>
`)
  })

  runner.on('done', () => {
    stream.end('')
  })
}

module.exports = {
  writeReportFor
}
