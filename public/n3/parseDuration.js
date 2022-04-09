'use strict'

// Credits to https://github.com/jkroso/parse-duration
// Removed module
// changed name to parseDuration

var duration = /(-?(?:\d+\.?\d*|\d*\.?\d+)(?:e[-+]?\d+)?)\s*([a-zµμ]*)/ig

/**
 * conversion ratios
 */

parseDuration.nanosecond =
parseDuration.ns = 1 / 1e6

parseDuration['µs'] =
parseDuration['μs'] =
parseDuration.us =
parseDuration.microsecond = 1 / 1e3

parseDuration.millisecond =
parseDuration.ms = 1

parseDuration.second =
parseDuration.sec =
parseDuration.s = parseDuration.ms * 1000

parseDuration.minute =
parseDuration.min =
parseDuration.m = parseDuration.s * 60

parseDuration.hour =
parseDuration.hr =
parseDuration.h = parseDuration.m * 60

parseDuration.day =
parseDuration.d = parseDuration.h * 24

parseDuration.week =
parseDuration.wk =
parseDuration.w = parseDuration.d * 7

parseDuration.month =
parseDuration.b =
parseDuration.d * (365.25 / 12)

parseDuration.year =
parseDuration.yr =
parseDuration.y = parseDuration.d * 365.25

/**
 * convert `str` to ms
 *
 * @param {String} str
 * @param {String} format
 * @return {Number}
 */

function parseDuration(str='', format='ms'){
  var result = null
  // ignore commas
  str = str.replace(/(\d),(\d)/g, '$1$2')
  str.replace(duration, function(_, n, units){
    units = parseDuration[units] || parseDuration[units.toLowerCase().replace(/s$/, '')]
    if (units) result = (result || 0) + parseFloat(n, 10) * units
  })

  return result && (result / parseDuration[format])
}
