/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect
// chai.use(require('dirty-chai'))

const compare = require('../lib/compareObject')

describe('The rename strategies', function () {

  it('should return empty objects for equal objects', function () {
    expect(compare({a: 1, b: 2}, {a: 1, b: 2})).to.deep.equal([{}, {}])
  })

  it('should return changed properties in both objects', function () {
    expect(compare({a: 1, b: 3}, {a: 1, b: 2})).to.deep.equal([{b: 3}, {b: 2}])
  })

  it('should return properties that only exist in one object (1)', function () {
    expect(compare({a: 1}, {a: 1, b: 2})).to.deep.equal([{}, {b: 2}])
  })

  it('should return properties that only exist in one object (2)', function () {
    expect(compare({a: 1, b: 2}, {a: 1})).to.deep.equal([{b: 2}, {}])
  })

})