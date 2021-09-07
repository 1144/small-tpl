/*--
  小小的模板引擎，适用于任何需要渲染模板的场景
  -site https://github.com/1144/small-tpl
*/
var regComment = /<!--[\D\d]*?-->/g;
var regNotEcho = /[\w.$]/;
var regCtrl = /[\n\r'\\]/g;
var ctrlChars = {'\r': '\\r', '\n': '\\n', "'": "\\'", '\\': '\\\\'};
var openTag = '<?';
var closeTag = '?>';
var $encode = "'use strict';" +
  "var $encodeChars={'<':'&lt;', '>':'&gt;', '\"':'&quot;', \"'\":'&#39;'}," +
  "$encode=function(s){if(typeof s==='string'){var res='',i=0,l=s.length;"+
  "for(;i<l;i++){res+=($encodeChars[s[i]]||s[i])}return res}return s};";

// 把模板源码编译为渲染函数
function compile(src, options) {
  options || (options = {});
  var leftTag = options.openTag || openTag;
  var rightTag = options.closeTag || closeTag;
  var uglify = options.uglify !== false;

  src = src.replace(regComment, '').split(leftTag);
  var code = uglify ? uglifyHtml(src[0]) : src[0];
  var js = code ? "var echo='"+replaceCtrl(code)+"'" : "var echo=''";
  var i = 1, len = src.length, srci, dataContext = '$data', inline = true;
  for (; i<len; i++) {
    srci = src[i].split(rightTag);
    if (srci.length>1) {
      code = srci[0].trim();
      if (code[0]==='=' || code[0]==='+') {
        if (code[0]==='+') {
          code = code.slice(1).trimLeft();
        } else if (code[1]===':') {
          code = "$encode("+wrapKey(dataContext, code.slice(2))+")";
        } else if (code[1]==='!') {
          code = wrapKey(dataContext, code.slice(2));
          code = "("+code+"==null?'':"+code+")";
        } else {
          code = wrapKey(dataContext, code.slice(1));
        }
        if (inline) {
          js += "+"+code;
        } else {
          js += "echo+="+code;
          inline = true;
        }
      } else if (code==='endeach') {
        dataContext = '$data';
        js += "}}();";
        inline = false;
      } else if (code.slice(0, 5)==='each ') {
        dataContext = '$item';
        js += ";~function(){'use strict';var $i=0,$_list_="+code.slice(5)+
          ",$count=$_list_.length,$item;for(;$i<$count;$i++){$item=$_list_[$i];";
        inline = false;
      } else {
        js += ";"+parseEcho(code)+";\r\n";
        inline = false;
      }
      code = uglify ? uglifyHtml(srci[1]) : srci[1];
      if (code) {
        if (inline) {
          js += "+'"+replaceCtrl(code)+"'";
        } else {
          js += "echo+='"+replaceCtrl(code)+"'";
          inline = true;
        }
      }
    } else {
      console.log('small-tpl compile error: Unclosed tag "'+leftTag+'"\n'+srci[0]);
    }
  }

  js += ';return echo';
  // console.log(js.indexOf('$encode')>0 ? $encode+js : "'use strict';"+js);
  try {
    return new Function('$data', '$fn',
      js.indexOf('$encode')>0 ? $encode+js : "'use strict';"+js);
  } catch (e) {
    console.log('small-tpl compile error:');
    console.log(e.stack);
    console.log(js);
    comments = null;
    return function () {};
  }
}

exports.compile = compile;

// 全局设置开始标记和结束标记
exports.setTag = function (open, close) {
  openTag = open;
  closeTag = close;
};

// 替换控制字符
function replaceCtrl(code) {
  return code.replace(regCtrl, function (m) {
    return ctrlChars[m];
  });
}

/*--
  去掉无用的空白字符，近乎于压缩html
  -note
    1、除了每个html块的第一行（可能是类似`...?> class="...`这种情况），行前的全去掉。
    2、如果`>`后至行尾换行符之间无有效字符，则包括换行符都去掉。
*/
function uglifyHtml(str) {
  var i = 0, len = str.length, res = '', temp = '',
    end, c;
  for (; i<len; i++) {
    c = str[i];
    if (c===' ' || c==='\t') {
      end==='>' || (temp += c);
    } else if (c==='\n' || c==='\r') {
      if (end!=='>') {
        // res += temp+c;
        // temp = '';
        temp += c;
        if (c==='\n') {
          end = '>'; // \n相当于最后一个字符是`>`
        }
      }
    } else {
      if (temp) {
        if (c==='<' && (temp==='\n' || temp==='\r\n')) {
          res += c;
        } else {
          res += temp+c;
        }
        temp = '';
      } else {
        res += c;
      }
      end = c;
    }
  }
  end==='>' || (res += temp); // `<i <?=imgAtrr?>` 要加上i后的空格
  return res;
}

// 解析echo语句
function parseEcho(code) {
  code = '^_^'+code;
  var tag = 'echo', n = 0, c,
    i = 3, l = code.length,
    q = '', // 存放单引号或双引号，为空则意味着不在字符串里
    r = '';
  for (; i<l; i++) {
    c = code[i];
    if (c==='"' || c==="'") {
      if (c===q && code[i-1]!=='\\') { // 字符串结束
        q = '';
      } else {
        q || (q = c); // q不存在，则字符串开始
      }
    } else if (q==='') { // 不在字符串里
      if (c===tag[n]) {
        n++;
      } else if (n===4) {
        // 排除：echox, echo.x, echo$, xecho, x.echo, $echo
        if (regNotEcho.test(c) || regNotEcho.test(code[i-5])) {
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

function wrapKey(context, key) {
  return context + '["' + key.trimLeft() + '"]'
}
