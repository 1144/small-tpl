# small-tpl
small template engine

# 标记语法

`<?` 开始标签

`?>` 结束标签

`each` 遍历数组

`endeach` 结束遍历

`echo` 在JS脚本里输出数据

`$data` 模板内嵌变量，渲染模板的数据对象

`$fn` 模板内嵌变量，渲染模板的helper对象

`$item` 模板内嵌变量，在遍历数组时指向当前数组元素

`$i` 模板内嵌变量，在遍历数组时指向当前数组元素的下标

`=` 在“each”外时输出$data对象的属性，在“each”里时输出$item对象的属性

`=!` 与“=”相似，区别在于会判断属性值是否为null或undefined，是则输出空字符串

`+` 直接字符串连接整个语句块，不做任何处理

# 示例

if 语句
```html
<h1>
<? if ($data.someProp) { ?>
  哈哈哈
<? } else { ?>
  嘿嘿嘿
<? } ?>
</h1>
```

三目运算，上面的代码等同于：
```html
<h1><?+ ($data.someProp ? '哈哈哈' : '嘿嘿嘿') ?></h1>
```

for 循环
```html
<ul>
<? each $data.focusList ?>
  <li>
		<?= title ?> <!-- 输出 focusList 里每一项的 title -->
  <? if ($item.subTitle) { ?> <!-- $item 指向 focusList 里的每一项 -->
		<span class="sub-title">
			<?+ $fn.encodeXssChar($item.subTitle) ?>
		</span>
	<? } ?>
  </li>
<? endeach ?>
</ul>
```
