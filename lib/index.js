// import Fs from 'fs'
import Path from 'path'
import Config from './config.js'
import ConfigLoader from './configLoader.js'

async function main() {
  const cwd = process.cwd()
  console.log('cwd:', cwd)
  const cmdArgv = process.argv
  const initData = Config.defaultData

  // 与命令行参数合并
  if (cmdArgv.length > 2) {
    Object.assign(initData, parseCmdArgv(cmdArgv.slice(2)))
  }

  initData.initFile = Path.join(cwd, initData.init)
  Object.assign(initData, ConfigLoader.loadInit(initData.initFile))
  console.log(initData)

  if (initData.local) {
    // 加载本地模板的配置
    initData.initOptionFile = Path.join(cwd, initData.local, Config.initOptionYML)
  } else if (initData.git) {
    // todo 下载远程模板
    initData.initOptionFile = Path.join(cwd, initData.local, Config.initOptionYML)
    // initConfigData = ConfigLoader.loadInitOption(initData.initOptionFile)
  } else {
    throw new Error('no src')
  }

  const initOption = ConfigLoader.loadInitOption(initData.initOptionFile)
  console.log(initOption)

  const renderData = ConfigLoader.getRenderData(initData, initOption)
  console.log(renderData)
}

main()

/* function getInitData() {
  const path = Path.join(cwd, Config.initFile)

  if (Fs.existsSync(path)) {
    const fc = Fs.readFileSync(path, 'utf-8')
    if (fc.startsWith(Config.initweFlag)) {
      throw Error('已经初始化过')
    }
    return MdParser.parseInit(fc)
  }

  return null
} */
