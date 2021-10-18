/**
 * 加载配置文件：init.yml, init-option.yml
 */
import Fs from 'fs'
import YAML from 'yaml'
import Util from './util.js'

const regexExt = /\.yml$/

function loadYamlFc(file) {
  if (Fs.existsSync(file)) {
    return Fs.readFileSync(file, 'utf-8')
  } else {
    const path = file.replace(regexExt, '.yaml')
    if (Fs.existsSync(path)) {
      return Fs.readFileSync(path, 'utf-8')
    }
  }
  return ''
}

/** 加载 init.yml */
function loadInit(file) {
  const fc = loadYamlFc(file)
  if (fc) {
    try {
      return YAML.parse(fc)
    } catch (err) {
      throw new Error('init.yml error')
    }
  }

  throw new Error('no init.yml')
}

/** 加载 init-option.yml */
function loadInitOption(file) {
  const fc = loadYamlFc(file)
  if (fc) {
    try {
      return YAML.parse(fc)
    } catch (err) {
      throw new Error('init-option.yml error')
    }
  }

  throw new Error('no init-option.yml')
}

function getRenderData(initData, initOption) {
  const renderData = Object.assign({}, initData)

  // templateTag
  if (initOption.templateTag) {
    renderData.templateTag = initOption.templateTag.trim()
  }
  const tag = renderData.templateTag.split(/\s+/)
  if (tag.length < 2) {
    throw Error('templateTag error')
  }
  renderData.__openTag = tag[0]
  renderData.__closeTag = tag[1]

  // filter
  let { filter } = initData
  if (filter) {
    if (!Array.isArray(filter)) {
      const filterOption = initOption.filter || {}
      filter = filterOption[filter] || filterOption.$default || []
    }
    renderData.__filter = filter.length ? hanldeFilter(filter) : false
  } else {
    renderData.__filter = false
  }

  // data
  const { data } = initOption
  if (data) {
    const dataConfig = initData.data || {}
    const mergedData = {}
    Object.keys(data).forEach(prop => {
      const configValue = dataConfig[prop]
      if (Util.isPlainObject(data[prop])) {
        mergedData[prop] = data[prop][configValue] || configValue || data[prop].$default
      } else {
        mergedData[prop] = configValue || data[prop]
      }
    })
    renderData.data = mergedData
  }

  return renderData
}

function hanldeFilter(filter) {
  const yes = []
  const no = []
  const dest = Object.create(null)

  filter.forEach(item => {
    if (item[0] === '-') {
      no.push(item.slice(1))
    } else if (item.includes('->')) {
      const map = item.split('->')
      const src = map[0].trim()
      yes.push(src)
      dest[src] = map[1].trim()
    } else {
      yes.push(item)
    }
  })

  return { yes, no, dest }
}

export default {
  loadInit,
  loadInitOption,
  getRenderData,
}
