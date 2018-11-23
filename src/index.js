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
    constructor(filename, opts, cb) {
        console.log(this)
        this.filename = typeof filename === 'string' ? filename : ''
        this.opts = opts || {}
        this.cb = cb
        this.origin =''
        // this.outPutName = opts.outPutName || 'sava.html'
        // this.$vue = opts.$vue
        // this.vueMod = !!this.$vue
        this.url = ''
        this.html = ''
        this.deps = {}
        this.fileReg = {
            css: /<link .*?href=\"(.+?)\"/g,
            js: /<script.*? src=\"(.+?)\"/g,
            img: /<img .*?src=\"(.+?)\"/g
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
        this.getHtml(() => {
            this.resolve()
            this.requestDeps()
        })

    }
    // download 
    // createTemplate () {
    //  let templ = ''
    //  let doc = this.doc
    //  let vueOjectStr = this.$vue.toString()

    //  let script = document.createElement('script')
    //  script.type = 'text/javascript'
    //  script.innerHTML = 'var $vue = JSON.parse(' + vueOjectStr + ')'
    //  doc.appendChild(script)
    //  this.html = templ = doc.innerHTML
    //  //将$vue转为json字符
    //  //在html模板中插入sript标签
    //  //将json字符串作为变量存入，然后转为对象
    //  //保存
    // }
    getHtml(callback) {
        let url = this.url
        if (url) {
            request(url, (res) => {
                this.html = res
                if (typeof callback === 'function') callback()
            })
        } else {
            this.html = document.documentElement.innerHTML
            if (typeof callback === 'function') callback()
        }
    }
    resolve() {

        let tpl = this.html
        let fileReg = this.fileReg
        Object.keys(fileReg).forEach(fileType => {
            let reg = fileReg[fileType]
            regFile.call(this, fileType, tpl)
        })
        console.log(this.deps)

        function regFile(fileType, string) {
            // save to this.deps[fileType]
            let reg = fileReg[fileType]
            let res
            if (!reg) return
            do {
                res = reg.exec(string)
                if (!res) return
                let file = res[1]
                if (file) {
                    let filePathArr = file.split('.')
                    let suffix = filePathArr.pop()
                    let filename = filePathArr.pop()
                    let filenameArr = filename.split('/')
                    filename = filenameArr.pop()
                    if (!filename) filename = filenameArr.pop()
                    filename = filename + '.' + suffix
                    let newFile = './' + filename
                    // newFile = newFile.substr(0, 1) == '.' ? newFile : newFile + '/'
                    this.deps[newFile] = file
                }
            } while (res)
        }

    }
    requestDeps(callback) {
        // deps -> request -> save(newName hash one fold) -> changeDepsName ->  replace tplName -> save tpl
        //this.deps
        let count = { num: 0 }
        let depsArr = Object.keys(this.deps)
        let depsLen = depsArr.length
        depsArr.forEach(newFile => {
            let oldFile = this.deps[newFile]
            let origin = this.origin 
            if (/^[\.\/]/.test(oldFile)) oldFile = origin + oldFile.replace(/^(\.\/|\/)/, '/')
                console.log(oldFile)
            request(oldFile, (res, url) => {
                ++count.num
                this.zip.file(newFile.substr(2), res)
                if (count.num >= depsLen /*depsLen*/ ) {
                    this.replaceTpl()
                    this.saveAs()
                    if (typeof callback === 'function') callback(res, url)
                }
            }, (err) => {
                ++count.num
                if (count.num >= depsLen /*depsLen*/ ) {
                    this.replaceTpl()
                    this.saveAs()
                    if (typeof callback === 'function') callback(res, url)
                }
            })
        })
    }
    replaceTpl() {
        let html = this.html
        Object.keys(this.deps).forEach((newFile) => {
            let oldFile = this.deps[newFile]
            html = html.replace(new RegExp(oldFile, 'g'), newFile)
        })
        this.html = html
        this.zip.file('index.html', html)

    }

    saveAs() {
        let self = this
        this.zip.generateAsync({ type: 'string' }).then(function(content) {
            download(content, self.filename + '.zip', 'application/zip')
        })

        //download(this.html, this.outPutName, this.mimeType)
    }
}