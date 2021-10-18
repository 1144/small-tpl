
const initOptionYML = 'init-option.yml'

const initweFlag = '### INITWE AT {time} ###'

const defaultData = {
  init: 'init.yml',
  templateTag: '<? ?>',
  git: '',
  local: '',
  src: '',
  dest: './',
  overwrite: false,
  report: true,
  filter: '',
  keepGitSrc: false,
  data: {},
}

export default {
  initOptionYML,
  initweFlag,
  defaultData,
}
