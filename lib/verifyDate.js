
/**
 * Compare the extracted date to the parts found in the filename.
 *
 * @param {{year: string, month: string, day: string, hour: string, minute: string, second: string}} actualDate the date that is returned by the pattern
 * @param {{year: string, month?: string, day?: string, hour?: string, minute?: string, second?: string}} dateFromFilename the date parts extracted from the filename
 */
module.exports = function verifyDate (actualDate, dateFromFilename) {
  if (actualDate == null) {
    return
  }
  if ((dateFromFilename.year == null || actualDate.year === dateFromFilename.year) &&
    (dateFromFilename.month == null || actualDate.month === dateFromFilename.month) &&
    (dateFromFilename.day == null || actualDate.day === dateFromFilename.day) &&
    (dateFromFilename.hour == null || actualDate.hour === dateFromFilename.hour) &&
    (dateFromFilename.minute == null || actualDate.minute === dateFromFilename.minute) &&
    (dateFromFilename.second == null || actualDate.second === dateFromFilename.second)) {
  } else {
    throw new Error(`Actual date ${JSON.stringify(actualDate)} does not match date from filename ${JSON.stringify(dateFromFilename)}`)
  }
}
