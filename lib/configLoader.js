/**
 * 加载
 */
import Fs from 'fs'
import YAML from 'yaml'

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

function getRenderData() {
  
}

export default {
  loadInit,
  loadInitOption,
  getRenderData,
}
