const fs = require('fs')
const generateMybricksComponentLibraryCode = require('generate-mybricks-component-library-code')

module.exports = class Dev {
  constructor(options) {
    this.options = options
    const { extraWatchFiles } = options
    this.setExtraWatchFilesMap(extraWatchFiles)
  }

  apply(compiler) {
    compiler.hooks.afterCompile.tap('after-compile', (compilation) => {
      Object.keys(this.extraWatchFilesMap || {}).forEach((extraWatchFile) => {
        compilation.fileDependencies.add(extraWatchFile);
      })
    });

    compiler.hooks.watchRun.tap('Dev WatchRun', (compilation) => {
      const { modifiedFiles } = compilation
      const { extraWatchFilesMap }  = this

      try {
        if (Array.from(modifiedFiles).find((modifiedFile) => extraWatchFilesMap[modifiedFile])) {
          const { option, editCodePath } = this.options
          const { mybricksJsonPath } = option
          const mybricksJson = JSON.parse(fs.readFileSync(mybricksJsonPath, 'utf-8'))
          const { editCode, runtimeCode, components } = generateMybricksComponentLibraryCode(
            {...option, mybricksJson},
            {
              useTestComponentLibrary: true,
              collectionStyleTags: true
            }
          );

          fs.writeFileSync(editCodePath, editCode)
          const extraWatchFiles = components.map(({comJsonPath}) => comJsonPath).concat(mybricksJsonPath)
          this.setExtraWatchFilesMap(extraWatchFiles)
        }
      } catch (e) {}
    });
  }

  setExtraWatchFilesMap(extraWatchFiles) {
    const extraWatchFilesMap = {}

    extraWatchFiles.forEach((extraWatchFile) => {
      extraWatchFilesMap[extraWatchFile] = true
    })

    this.extraWatchFilesMap = extraWatchFilesMap
  }
}
