/**
 * 小小的模板引擎，适用于任何需要渲染模板的场景
 * GitHub: https://github.com/1144/small-tpl
 */
const regComment = /<!--[\D\d]*?-->/g
const regNotEcho = /[\w.$]/
const regCtrl = /[\r\n'\\]/g
const regIndent = /\$indent\(/g
const ctrlChars = {
  '\r': '\\r',
  '\n': '\\n',
  '\'': '\\\'',
  '\\': '\\\\'
}
const $_get = `
  var $_get = function (data, key) {
    return data[key] || (data[key] == null ? '' : data[key]);
  };
`
const $encode = `
  var $encodeChars = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  var $encode = function (s) {
    if (typeof s === 'string') {
      var res = '', i = 0, l = s.length;
      for (; i < l; i++) {
        res += $encodeChars[s[i]] || s[i];
      }
      return res;
    }
    return s == null ? '' : s;
  };
`
const $indent = `
  var $indent = function (indent, s) {
    return s.replace(/\\n./g, function (m) { return m[0] + indent + m[1] });
  };
`
let openTag = '<?'
let closeTag = '?>'

/**
 * 全局设置开始标记和结束标记
 * @param {String} open 开始标记
 * @param {String} close 结束标记
 */
function setTag(open, close) {
  openTag = open
  closeTag = close
}

function wrapGetter(dataCtx, key) {
  return `$_get(${dataCtx}, '${key.trimLeft()}')`
}

function getIndent(str) {
  return `'${replaceCtrl(str.slice(str.lastIndexOf('\n') + 1))}'`
}

/**
 * 把模板源码编译为渲染函数
 */
function compile(template, options) {
  options || (options = {})
  const leftTag = options.openTag || openTag
  const rightTag = options.closeTag || closeTag
  const uglify = options.uglify !== false
  const src = template.replace(regComment, '').split(leftTag)
  const len = src.length

  let code = uglify ? uglifyHtml(src[0]) : src[0]
  let js = code ? `var echo = '${replaceCtrl(code)}'` : `var echo = ''`
  let dataCtx = '$data'
  let inline = true
  let i = 1
  let frags

  for (; i < len; i++) {
    frags = src[i].split(rightTag)
    if (frags.length > 1) {
      code = frags[0].trim()
      if (code[0] === '=' || code[0] === '+') {
        if (code[0] === '+') {
          code = code.slice(1).trimLeft()
          if (code.includes('$indent(')) {
            code = code.replace(regIndent, `$indent(${getIndent(src[i - 1])}, `)
          }
        } else if (code[1] === ':') {
          code = `$encode(${wrapGetter(dataCtx, code.slice(2))})`
        } else if (code[1] === ']') {
          code = `$indent(${getIndent(src[i - 1])}, ${wrapGetter(dataCtx, code.slice(2))})`
        } else {
          code = wrapGetter(dataCtx, code.slice(1))
        }
        if (inline) {
          js += code.includes('?') ? `+ (${code})` : `+ ${code}`
        } else {
          js += code.includes('?') ? `echo += (${code})` : `echo += ${code}`
          inline = true
        }
      } else if (code === 'endeach') {
        dataCtx = '$data'
        js += '}}();'
        inline = false
      } else if (code.slice(0, 5) === 'each ') {
        dataCtx = '$item'
        js += '; ~function () {' +
          'var $_list = ' + code.slice(5) + ', $count = $_list.length, $i = 0, $item;' +
          'for (; $i < $count; $i++) { $item = $_list[$i];'
        inline = false
      } else {
        if (code.includes('$indent(')) {
          code = code.replace(regIndent, `$indent(${getIndent(src[i - 1])}, `)
        }
        js += `; ${parseEcho(code)};\r\n`
        inline = false
      }
      code = uglify ? uglifyHtml(frags[1]) : frags[1]
      if (code) {
        if (inline) {
          js += `+ '${replaceCtrl(code)}'`
        } else {
          js += `echo += '${replaceCtrl(code)}'`
          inline = true
        }
      }
    } else {
      console.error(`small-tpl compile error: Unclosed tag '${leftTag}'\n${frags[0]}`)
    }
  }

  js += '; return echo'
  if (js.includes('$encode(')) {
    js = $encode + js
  }
  if (js.includes('$indent(')) {
    js = $indent + js
  }
  // console.log(js)
  try {
    return new Function('$data', '$fn', `  'use strict';${$_get}  ${js}`)
  } catch (e) {
    console.error(`small-tpl compile error:\n${e.stack}\n${js}`)
    return function () {}
  }
}

// 替换控制字符
function replaceCtrl(code) {
  return code.replace(regCtrl, function (m) {
    return ctrlChars[m]
  })
}

/*--
  去掉无用的空白字符，近乎于压缩html
  -note
    1、除了每个html块的第一行（可能是类似`...?> class="...`这种情况），行前的全去掉。
    2、如果`>`后至行尾换行符之间无有效字符，则包括换行符都去掉。
*/
function uglifyHtml(str) {
  var i = 0,
    len = str.length,
    res = '',
    temp = '',
    end, c;
  for (; i < len; i++) {
    c = str[i];
    if (c === ' ' || c === '\t') {
      end === '>' || (temp += c);
    } else if (c === '\n' || c === '\r') {
      if (end !== '>') {
        // res += temp+c;
        // temp = '';
        temp += c;
        if (c === '\n') {
          end = '>'; // \n相当于最后一个字符是`>`
        }
      }
    } else {
      if (temp) {
        if (c === '<' && (temp === '\n' || temp === '\r\n')) {
          res += c;
        } else {
          res += temp + c;
        }
        temp = '';
      } else {
        res += c;
      }
      end = c;
    }
  }
  end === '>' || (res += temp); // `<i <?=imgAtrr?>` 要加上i后的空格
  return res;
}

// 解析echo语句
function parseEcho(code) {
  code = '^_^' + code;
  var tag = 'echo',
    n = 0,
    c,
    i = 3,
    l = code.length,
    q = '', // 存放单引号或双引号，为空则意味着不在字符串里
    r = '';
  for (; i < l; i++) {
    c = code[i];
    if (c === '"' || c === "'") {
      if (c === q && code[i - 1] !== '\\') { // 字符串结束
        q = '';
      } else {
        q || (q = c); // q不存在，则字符串开始
      }
    } else if (q === '') { // 不在字符串里
      if (c === tag[n]) {
        n++;
      } else if (n === 4) {
        // 排除：echox, echo.x, echo$, xecho, x.echo, $echo
        if (regNotEcho.test(c) || regNotEcho.test(code[i - 5])) {
          // n = 0;
        } else {
          r += '+=';
        }
        n = 0;
      } else {
        n = 0;
      }
    }
    r += c;
  }
  return r;
}

exports.setTag = setTag
exports.compile = compile
