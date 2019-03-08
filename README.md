# small-tpl

A small lightweight template engine.

Install：`npm install small-tpl` or `yarn add small-tpl`

# 模板语法

`<?` 开始标签

`?>` 结束标签

`each` 遍历数组

`endeach` 结束遍历

`echo` 在JS脚本里输出数据

`$data` 模板内嵌变量，渲染模板的数据对象

`$fn` 模板内嵌变量，渲染模板的helper对象

`$item` 模板内嵌变量，遍历数组时指向当前数组元素

`$i` 模板内嵌变量，遍历数组时指向当前数组元素的下标

`$count` 模板内嵌变量，遍历数组时指向当前数组的长度

`=` 在“each”外时输出$data对象的属性，在“each”里时输出$item对象的属性

`=!` 与“=”相似，区别在于会判断属性值是否为null或undefined，是则输出空字符串

`+` 直接字符串连接整个语句块，不做任何处理

# API

- compile(template, [options])

  编译模板字符串为渲染函数。

  `options`有3个选项：`openTag`自定义开始标签；`closeTag`自定义结束标签；`uglify`是否去除HTML里无用的空白字符，默认`true`去除。

- setTag(openTag, closeTag)

  全局设置开始标签和结束标签。

# Demo

Hello world
```javascript
const { compile } = require('small-tpl')

// for pure Object
const render = compile('<?= hello ?>, <?= name ?>!')
render({ hello: 'Hello', name: 'girl' })
// => Hello, girl!

// for Array
const render = compile('<?+ $data[0] ?>, <?+ $data[1] ?>!')
render([ 'Hello', 'girl' ])
// => Hello, girl!
```

标签内可以使用原生JS语法：
```html
<div>
<? if ($data.someProp) { ?>
  <h1>哈哈哈</h1>
<? } else { ?>
  <i>嘿嘿嘿</i>
<? } ?>
</div>
```

JS代码内可以使用`echo`语句，上面的代码等同于：
```html
<div>
<?
  if ($data.someProp) {
    echo '<h1>哈哈哈</h1>' // 也可以写成 echo('<h1>哈哈哈</h1>')
  } else {
    echo '<i>嘿嘿嘿</i>'
  }
?>
</div>
```

三目运算：
```html
<h1><?+ ($data.someProp ? '哈哈哈' : '嘿嘿嘿') ?></h1>
```

遍历数组：
```html
<h1><?= title ?></h1> <!-- 输出 $data.title -->
<ul>
<? each $data.someList ?>
  <li>
    <?= title ?> <!-- 输出 someList 里每一项的 title，即 $item.title -->
  <? if ($item.subTitle) { ?> <!-- $item 指向 someList 的元素 -->
    <span class="sub-title">
      <?+ $fn.encodeXssChar($item.subTitle) ?>
    </span>
  <? } ?>
  </li>
<? endeach ?>
</ul>
```
**特别注意**：`each`和`endeach`只能放在独立的`<? ?>`标签内，不能跟其他代码同处一个标签内。

# Deep

```javascript
compile('<p><?= hello ?>, <?= name ?>!</p>')

// 模板将被编译为如下函数
function anonymous($data, $fn) {
  'use strict';
  var echo = '<p>' + $data.hello + ', ' + $data.name + '!</p>';
  return echo
}

compile(`
  <h1><?= title ?></h1>
  <ul>
  <? each $data.someList ?>
    <li>
      <?= title ?>
    </li>
  <? endeach ?>
  </ul>
`)

// 模板将被编译为如下函数
function anonymous($data, $fn) {
  'use strict';
  var echo = '<h1>' + $data.title + '</h1><ul>';
  ~function () {
    'use strict';
    var $i = 0, $_list_ = $data.someList, $count = $_list_.length, $item;
    for (; $i < $count; $i++) {
      $item = $_list_[$i];
      echo += '<li>' + $item.title + '</li>'
    }
  }();
  echo += '</ul>';
  return echo
}
```
