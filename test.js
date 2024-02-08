const { compile } = require('./index')

function it(template, data, expected, options) {
  const res = compile(template, options)(data)
  if (res !== expected) {
    console.log('Template:\n\n%s\n', template)
    console.log('Expected:\n', expected)
    console.log('Got:\n', res)
    console.log('\nTest failed!\n')
    process.exit()
  }
}

it('<?= hello ?> world', { hello: 'hello' }, 'hello world')

it('<?= hello ?> world', {}, ' world')

it(`<a><?=: content ?></a>`, { content: '1</script>"' }, '<a>1&lt;/script&gt;&quot;</a>')

it(`
  <? $encodeChars['b'] = 'B' ?> <!-- 扩充$encodeChars -->
  <?=: content ?>
`, { content: 'abc' }, 'aBc')

it(`
  <? $encodeChars['b'] = 'B' ?>
  <?+ $encode($data.content) ?> <!-- 手动调用$encode -->
`, { content: 'abc' }, 'aBc')

it('<%= hello %>', { hello: 'hello' }, 'hello', { openTag: '<%', closeTag: '%>' })

it('<?+ $data ?>', 'hello', 'hello')

it('a <?+ $data ? $data : 123 ?> b', 'hello', 'a hello b')

it('<?+ $data[1] ?>', ['blabla', 'hello'], 'hello')

it(`
  <h1><?= title ?></h1>
  <ul>
  <? each $data.someList ?>
    <li>
      <?= title ?>
    </li>
  <? endeach ?>
  </ul>
`,
  { title: '1', someList: [{ title: 2 }] },
  '<h1>1</h1><ul><li>2</li></ul>'
)

it('<?= 全角字符🎉 ?> world', { '全角字符🎉': 'hello' }, 'hello world')

it('\n  <?=] hello ?>',
  { hello: 'line1\n  line2\n' },
  '\n  line1\n    line2\n',
  { uglify: false }
)

it('\n...<?=] hello ?>',
  { hello: 'line1\n  line2\n' },
  '\n...line1\n...  line2\n',
  { uglify: false }
)

it('\n..<?+ $indent($data.hello) ?>',
  { hello: 'line1\n  line2\n' },
  '\n..line1\n..  line2\n',
  { uglify: false }
)

console.log('Test passed!')

// const render = compile('<p><?=: content ?></p>')
// console.log(render.toString())
