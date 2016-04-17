/* for mlt.html */

/* var site = "http://aarepo.dip.jp/svn/aarepo/trunk/HukuTemp/" */
var site = ""
var requests = []
var requestIndex
var xhr
var aaNumber = 0

function setupSite(){
	var url = location.href
	var i = url.indexOf("?")
	i = url.lastIndexOf("/", i - 1)
	i = url.lastIndexOf("/", i - 1)
	site = url.slice(0, i + 1) /* including "/" */
	site = site + "HukuTemp/"
}

function aaindexGet(route){
	var list = aaindex
	for(var i = 0; i < route.length - 1; ++i){
		list = list[route[i]].l
	}
	return list[route[route.length - 1]]
}

function routeOfId(id){
	var result = []
	var p = 0
	while(p < id.length){
		var n = id.indexOf("_", p)
		if(n < 0){
			n = id.length
		}
		result = result.concat([parseInt(id.slice(p, n))])
		p = n + 1
	}
	return result
}

function setTitle(name, children){
	var title = document.getElementsByTagName("title")[0]
	var s = title.firstChild.nodeValue + " - " + name
	if(children){
		s = s + " (" + children.length.toString() + " files)"
	}
	title.removeChild(title.firstChild)
	title.appendChild(document.createTextNode(s))
}

function indexEndOfLine(s, index){
	var result = s.indexOf("\n", index)
	if(result < 0){
		result = s.length
	}
	return result
}

function makeJump(jump, subtitle, classValue){
	var d = document.createElement("div")
	d.setAttribute("class", classValue)
	var a = document.createElement("a")
	a.setAttribute("href", "#aa_" + aaNumber.toString())
	a.appendChild(document.createTextNode(subtitle))
	d.appendChild(a)
	jump.appendChild(d)
	return d
}

function makePage(name, mlt){
	var jump = document.getElementById("jump")
	var contents = document.getElementById("contents")
	makeJump(jump, titleOfFilename(name), "filename")
	var prev
	var aaExisting = false
	var i = 0
	if(mlt.slice(0, 7) == "[SPLIT]"){
		i = indexEndOfLine(mlt, 0) + 1
	}
	while(i < mlt.length){
		var eol = indexEndOfLine(mlt, i)
		if(i == eol){
			++i;
			continue
		}
		if(mlt.slice(eol + 1, eol + 8) == "[SPLIT]"){
			if(!aaExisting && prev){
				prev.setAttribute("class", "remark")
			}
			var subtitle = mlt.slice(i, eol)
			prev = makeJump(jump, subtitle, "section")
			aaExisting = false
		}else{
			while(eol < mlt.length && mlt.slice(eol + 1, eol + 8) != "[SPLIT]"){
				eol = indexEndOfLine(mlt, eol + 1)
			}
			var aa = mlt.slice(i, eol)
			var d = document.createElement("div")
			d.setAttribute("id", "aa_" + aaNumber.toString())
			d.setAttribute("class", "aa")
			d.appendChild(document.createTextNode(aa))
			contents.appendChild(d)
			aaExisting = true
			++aaNumber
		}
		eol = indexEndOfLine(mlt, eol + 1) /* skip [SPLIT] */
		i = eol + 1
	}
}

function xhr_onload(){
	switch(xhr.readyState){
	case 4: /* complete */
		if(xhr.status == 0 || (xhr.status >= 200 && xhr.status < 300)){
			var data = xhr.response
			var text = Encoding.convert(new Uint8Array(data),
			                            {to:'UNICODE',
			                             from:'SJIS',
			                             type:'string'})
//			var decoder = new TextDecoder("windows-31j")
//			var text = decoder.decode(data)
			makePage(requests[requestIndex].r, text)
		}else{
			console.log(xhr.statusText)
		}
		++requestIndex
		if(requestIndex < requests.length){
			setTimeout('request()',100)
		}
		break
	}
}

function xhr_onerror(){
	console.log(xhr.statusText)
}

function request(){
	var url = site + requests[requestIndex].r.replace(/ /g, "%20")
	console.log(url)
	xhr = new XMLHttpRequest()
	xhr.onload = xhr_onload
	xhr.onerror = xhr_onerror
	xhr.open("GET", url)
	xhr.responseType = "arraybuffer"
	xhr.send(null)
}

function do_onload(){
	setupSite()
	var query = location.search.substr(1).split("&");
	for(var i = 0; i < query.length; ++i){
		var kv = query[i].split("=")
		var key = kv[0]
		var value = kv[1]
		if(key == "route"){
			var route = routeOfId(value)
			var item = aaindexGet(route)
			setTitle(item.r, item.s)
			if(item.s){
				requests = item.s
			}else{
				requests = [item]
			}
			requestIndex = 0
			setTimeout('request()',100)
		}
	}
}

fixStylesheet("mlt-old.css")
