const _toString = Object.prototype.toString

function isPlainObject(value) {
  return _toString.call(value) === '[object Object]'
}

const methods = {
  'y': 'getFullYear',
  'm': 'getMonth',
  'd': 'getDate',
  'h': 'getHours',
  'i': 'getMinutes',
  's': 'getSeconds'
}
function formatTime(time, format) {
  if (typeof time === 'number') {
    time = new Date(time * 1000)
  }
  return (format || 'Y-M-D H:I:S').replace(/[YMmDdHIS]/g, function(key) {
    let val = time[methods[key.toLowerCase()]]()
    if (key === 'M' || key === 'm') { // 月份
      val += 1
    }
    return key < 'a' && val < 10 ? '0' + val : val
  })
}

export default {
  isPlainObject,
  formatTime,
}
