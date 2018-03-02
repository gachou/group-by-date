const deepEqual = require('deep-equal')

/**
 *
 * @param {object} a
 * @param {object} b
 * @return {array<object>} an containing the different fields for each object
 */
module.exports = function compareObject (obj1, obj2) {
  return [
    pickDifferentProperties(obj1, obj2),
    pickDifferentProperties(obj2, obj1)
  ]
}

/**
 * Returns the properties of an object that do not have the same value as in the other object
 * @param obj
 * @param otherObj
 * @returns {object}
 */
function pickDifferentProperties (obj, otherObj) {
  const result = {}
  Object.keys(obj).forEach(key => {
    if (!deepEqual(obj[key], otherObj[key])) {
      result[key] = obj[key]
    }
  })
  return result
}
