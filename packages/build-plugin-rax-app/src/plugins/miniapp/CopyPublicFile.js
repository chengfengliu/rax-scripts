const { resolve } = require('path');
const { copySync } = require('fs-extra');
const chokidar = require('chokidar');

/**
 * Copy public directories to dist
 */
module.exports = class JSX2MPRuntimePlugin {
  constructor({ mode = 'build', rootDir = '', outputPath = '', constantDirectories = [] }) {
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
    this.constantDirectories = constantDirectories;
    console.log("JSX2MPRuntimePlugin -> constructor -> this.constantDirectories", this.constantDirectories)
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'CopyPublicFilePlugin',
      (compilation, callback) => {
        function copyPublicFile(constantDirectories, rootDir, outputPath) {
          for (let srcDir of constantDirectories) {
            const srcPath = resolve(rootDir, srcDir);
            const distPath = resolve(outputPath, srcDir.split('/').slice(1).join('/'));
            copySync(srcPath, distPath, {
              filter: (file) => !/\.js$/.test(file)
            });
          }
        }
        if (this.mode === 'build') {
          copyPublicFile(this.constantDirectories, this.rootDir, this.outputPath);
        } else {
          const constantDirectoryPaths =  this.constantDirectories.map(dirPath => resolve(this.rootDir, dirPath));
          const watcher = chokidar.watch(constantDirectoryPaths);
          watcher.on('all', () => {
            copyPublicFile(this.constantDirectories, this.rootDir, this.outputPath);
          });
        }

        callback();
      }
    );
  }
};
