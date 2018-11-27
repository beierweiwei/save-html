/*
思路： requestUrl()->saveToString-> analyseDep -> saveDep -> rerenderTemp -> matchResponse->
思路 2：vue实例 和 htmlString -> 将vue实例转为字符串保存到html模板中，在模板中将字符串转为对象，保存
 */
import download from './lib/download.js'
import lodash from 'lodash'
import request from './lib/request'
import JSZip from './lib/jszip'
/**
 * [process description]
 * @type {SaveToHtml}
 */

/**
 * [SaveToHtml description]
 * @param {[type]}   filename [description]
 * @param {[type]}   opts     [{staticUrl, origin, baseUrl, apiMapData}]
 * @param {Function} cb       []
 */
export default class SaveToHtml {
    constructor(filename, opts) {
        console.log(this)
        this.filename = typeof filename === 'string' ? filename : ''
        this.opts = opts || {}
        this.origin = ''
        // this.outPutName = opts.outPutName || 'sava.html'
        // this.$vue = opts.$vue
        // this.vueMod = !!this.$vue
        this.url = ''
        this.html = ''
        this._deps = {},
            this._deps_added = {}
        this._tpl_replaced = []
        this.subDeps = {},
            this.fileReg = {
                css: /<link .*?href=\"(.+?)\"/g,
                js: /<script.*? src=\"(.+?)\"/g,
                img: /<img .*?src=\"(.+?)\"/g,
                // url: /url(.*)/g,
            }

        // get url and origin 
        if (this.opts.url) {
            this.url = this.opts.url.substr(-1, 1) === '/' ? this.opts.url.substr(-1) : this.opts.url
            let originReg = this.url.match(/^.+(\.com|\.cn|\.com\.cn|\.net)+?/)
            console.log(originReg)
            this.origin = originReg ? originReg[0] : document.origin

        } else {
            this.url = window.href
            this.origin = document.origin
        }
        this.zip = new JSZip()
    }
    getHtml(callback) {
        let url = this.url
        return new Promise((resolve, reject) => {
            if (url) {
                request(url, (res) => {
                    this.html = res
                    resolve()
                }, (err) => {
                    reject(err.message)
                })
            } else {
                this.html = document.documentElement.innerHTML
                resolve()
            }
        })

    }
    addDeps(depObj) {
        if (typeof depObj !== 'object') return
        this._deps_added = { ...this._deps_added, ...depObj }
    }
    resolve(_tpl) {
        let tpl = this.html
        let fileReg = this.fileReg
        Object.keys(fileReg).forEach(fileType => {
            let reg = fileReg[fileType]
            regFile.call(this, fileType, tpl)
        })
        console.log(this._deps)

        function regFile(fileType, string) {
            // save to this.deps[fileType]
            let reg = fileReg[fileType];
            let res
            if (!reg) return
            do {
                res = reg.exec(string);
                if (!res) return
                let file = res[1];
                if (file) {
                    if (!~file.indexOf('data:image')) {
                        let filePathArr = file.split('/');
                        let filename = filePathArr.pop();
                        let fileNameArr = filename.split('.')
                        let suffix = fileNameArr.pop() || '';
                        let newFile = './' + filename
                        this._deps[newFile] = file;
                    }

                }
            } while (res)
        }
    }
    resolve_deep_deps(fileList, callback, finish
        ) {
        /* let list = Object.values(this._deps).filter(originFile => {
             return (originFile.split('.').pop() == 'css')
         })*/

        (function next(n) {
            if (n <= fileList.length) {
                let file = fileList[n]
                request(file, (content) => {
                    /*                匹配 获取css依赖列表，如果有深度依赖，向下遍历,如果无依赖向右遍历
                    if (hasDeep) resolve_deep_deps(dep, function () {
                       callback(function () {next(n+1)})
                    }})
                    else callback(function () {next(n + 1)})
                */
                })
            } else {
                done()
            }

        })(0)

    }
    resolveCssUrl(fileStr) {
        //    let res = this.fileReg.url.exec(fileStr)
        //    let file = res[1]
        //    if (file) {

        //    }
        // },
        _requestDeps(callback) {
            // deps -> request -> save(newName hash one fold) -> changeDepsName ->  replace tplName -> save tpl
            //this.deps
            let count = { num: 0 }
            let depsArr = Object.keys(this._deps)
            let depsLen = depsArr.length
            depsArr.forEach(newFile => {
                let oldFile = this._deps[newFile]
                let origin = this.origin
                if (/^[\.\/]/.test(oldFile)) oldFile = origin + oldFile.replace(/^(\.\/|\/)/, '/')
                console.log(oldFile)
                request(oldFile, (res, url) => {
                    ++count.num
                    this.zip.file(newFile.substr(2), res)
                    if (count.num >= depsLen /*depsLen*/ ) {
                        if (typeof callback === 'function') callback(res, url)
                    }
                }, (err) => {
                    ++count.num
                    if (count.num >= depsLen /*depsLen*/ ) {
                        if (typeof callback === 'function') callback(res, url)
                    }
                })
            })
        }
        _replaceTpl() {
            debugger
            let html = this.html
            Object.keys(this._deps).forEach((newFile) => {
                let oldFile = this._deps[newFile]
                html = html.replace(new RegExp(oldFile, 'g'), newFile)
            })
            this.html = html
            this.zip.file('index.html', html)

        }
        /**
         * [replaceTpl description]
         * @param  {Function} callback (tpl) => tpl
         * @return {[type]}            [description]
         */
        add_replace(replaceFn) {
            if (typeof replaceFn !== 'function') return
            this._tpl_replaced.push(replaceFn)
        }

        saveAs(filename) {

            debugger
            // if ( typeof this.addDeps === 'function') {
            //     this.addDeps()
            // }
            this.getHtml().then(res => {
                this.resolve()
                this._deps = { ...this._deps, ...this._deps_added }
                this._requestDeps(() => {
                    this._tpl_replaced.forEach(rF => {
                        this.html = rF(this.html)
                    })
                    this._replaceTpl()
                    this.zip.generateAsync({ type: 'string' }).then((content) => {
                        download(content, (filename || this.filename) + '.zip', 'application/zip')
                    })
                })
            })
        }

    }

    //调用场景
    //let save = new saveHtml('abc', {url: 'www.baidu.com', otherDeps: [{css: 'abc.css'}]})
    //添加额外的依赖
    // save.addDeps({'origin/static/abc.css': 'abc.css', 'origin/static/abc.img': './abc.img'}) 
    // save.saveas('abc.zip')

    //save.resolve(callback(err, next) {
    //
    //})
    //在save之前，对模板进行自定义的更改
    //