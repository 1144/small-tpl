const { compile } = require('./index')

function it(template, data, expected, options) {
  const res = compile(template, options)(data)
  if (res !== expected) {
    console.log('Expected:', expected)
    console.log('Got:', res)
    throw Error('small-tpl error')
  }
}

it('<?= hello ?> world', { hello: 'hello' }, 'hello world')

it('<?=! hello ?> world', { }, ' world')

it('<%= hello %>', { hello: 'hello' }, 'hello', { openTag: '<%', closeTag: '%>' })

it('<?+ $data ?>', 'hello', 'hello')

it('<?+ $data[1] ?>', [ ' ', 'hello' ], 'hello')

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
{ title: '1', someList: [{title: 2}] },
'<h1>1</h1><ul><li>2</li></ul>'
)

console.log('Test passed!')

// const render = compile('<p><?= hello ?>, <?= name ?>!</p>')
// console.log(render.toString())
