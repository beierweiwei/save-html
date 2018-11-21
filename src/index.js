/*
思路： requestUrl()->saveToString-> analyseDep -> saveDep -> rerenderTemp -> matchResponse->
思路 2：vue实例 和 htmlString -> 将vue实例转为字符串保存到html模板中，在模板中将字符串转为对象，保存
 */
import download from './lib/download.js'
import lodash from 'lodash'
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
	constructor (filename, opts, cb) {
		this.filename = typeof filename === 'string' ? filename : ''
		opts = opts || {} 
		this.cb = cb 
		this.outPutName = opts.outPutName || 'sava.html'
		this.$vue = opts.$vue
		this.vueMod = !!this.$vue
		this.el = this.filename || 'body' 
		this.html = ''
		this.mimeType = opts.mimeType || 'text/html'
		this.doc = document.getElementById(this.el)
		this.innerHTML = this.doc.innerHTML
		this.deps = {
			css: [],
			js: [],
			imgs: []
		}
	}
	// download 
	// createTemplate () {
	// 	let templ = ''
	// 	let doc = this.doc
	// 	let vueOjectStr = this.$vue.toString()

	// 	let script = document.createElement('script')
	// 	script.type = 'text/javascript'
	// 	script.innerHTML = 'var $vue = JSON.parse(' + vueOjectStr + ')'
	// 	doc.appendChild(script)
	// 	this.html = templ = doc.innerHTML
	// 	//将$vue转为json字符
	// 	//在html模板中插入sript标签
	// 	//将json字符串作为变量存入，然后转为对象
	// 	//保存
	// }
	analyseDep () {
		var resolveScr = (matched, subMatch) => {
			console.log('xxx', matched, subMatch)
		}
		let tpl = this.innerHTML
		let	jsMatched = tpl.match(/(?=<script).*? src=\"(.+?)\"/g, resolveScr)
		let	cssMatched = tpl.match(/<link .*?href=\"(.+?)\"/g, resolveScr)
		let	imgs = tpl.match(/<img .*?src=\"(.+?)\"/g)
		let matcheds = []
		matcheds.push(jsMatched, cssMatched, imgs)
		matcheds = matcheds.filter(m => m).map(m => {return m.map(mt => mt.match(/(src|link)=\"(.+?)\"/)[2])})
		console.log(matcheds)
	}
	save () {
		this.analyseDep()
		// download(this.html, this.outPutName, this.mimeType)
	}
}



