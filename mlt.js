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

function aaindexGet(indexes){
	if(!indexes || indexes.length == 0){
		return null
	}
	var list = aaindex
	for(var i = 0; i < indexes.length - 1; ++i){
		if(indexes[i] >= list.length){
			return null
		}
		list = list[indexes[i]].l
	}
	if(indexes[indexes.length - 1] >= list.length){
		return null
	}
	return list[indexes[indexes.length - 1]]
}

function findIndexesByName(name){
	function find(name, list, indexes){
		for(var i = 0; i < list.length - 1; ++i){
			var item = list[i]
			if(item.r == name){
				return indexes.concat([i])
			}else if(item.l){
				var result = find(name, item.l, indexes.concat([i]))
				if(result){
					return result
				}
			}
		}
		return null
	}
	return find(name, aaindex, [])
}

function parseIndexes(s){
	var result = []
	var p = 0
	while(p < s.length){
		var n = s.indexOf("_", p)
		if(n < 0){
			n = s.length
		}
		result = result.concat([parseInt(s.slice(p, n))])
		p = n + 1
	}
	return result
}

function setTitle(name, children){
	var title = document.getElementsByTagName("title")[0]
	var s
	var titleHasTextNode = title.firstChild
	if(titleHasTextNode){
		s = title.firstChild.nodeValue
		title.removeChild(title.firstChild)
	}else{
		s = title.text
	}
	var t = titleOfFilename(name)
	if(children){
		t = t + " (" + children.length.toString() + " files)"
	}
	s = t + " - " + s
	if(titleHasTextNode){
		title.appendChild(document.createTextNode(s))
	}else{
		title.text = s
	}
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
		eol = mlt.indexOf("\n[SPLIT]", i)
		if(eol == i){
			i = indexEndOfLine(mlt, 0) + 1 /* empty */
			continue
		}else if(eol < 0){
			eol = mlt.length
		}
		var aa = mlt.slice(i, eol)
		if(aa.indexOf("\n") < 0){
			if(!aaExisting && prev){
				prev.setAttribute("class", "remark")
			}
			prev = makeJump(jump, aa, "section")
			aaExisting = false
		}else{
			var d = document.createElement("pre")
			d.setAttribute("id", "aa_" + aaNumber.toString())
			if(aaNumber % 2 == 0){
				d.setAttribute("class", "aa")
			}else{
				d.setAttribute("class", "aa even")
			}
			d.appendChild(document.createTextNode(aa))
			contents.appendChild(d)
			aaExisting = true
			++aaNumber
		}
		eol = indexEndOfLine(mlt, eol + 1) /* skip [SPLIT] */
		i = eol + 1
	}
}

function IEBinaryToArray(responseBody){
	var dataString = callCStr(responseBody)
	var data = new Array(dataString.length * 2)
	var j = 0
	for(var i = 0; i < dataString.length; ++i){
		var c = dataString.charCodeAt(i)
		var c1 = c & 0xff
		if(c1 != 13) data[j++] = c1
		var c2 = c >> 8
		if(c2 != 13) data[j++] = c2
	}
	if(j > 0 && data[j - 1] == 0) --j
	data.length = j
	return data
}

function xhr_onreadystatechange(){
	switch(xhr.readyState){
	case 4: /* complete */
		if(xhr.status == 0 || (xhr.status >= 200 && xhr.status < 300)){
			var data
			if(inIE){
				data = IEBinaryToArray(xhr.responseBody)
			}else{
				data = new Uint8Array(xhr.response)
			}
			var text = Encoding.convert(data,
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

function xhr_ontimeout(){
	console.log(xhr.statusText)
}

function request(){
	var url = site + encodeURI(requests[requestIndex].r)
//	console.log(url)
	xhr = new XMLHttpRequest()
	xhr.onreadystatechange = xhr_onreadystatechange
	xhr.ontimeout = xhr_ontimeout
	xhr.open("GET", url)
	xhr.responseType = "arraybuffer"
	xhr.timeout = 10000 /* 10 seconds */
	xhr.send(null)
}

function do_onload(){
	setupSite()
	var query = location.search.substr(1).split("&")
	var indexes
	var rname
	for(var i = 0; i < query.length; ++i){
		var kv = query[i].split("=")
		var key = kv[0]
		var value = kv[1]
		if(key == "i"){
			indexes = parseIndexes(value)
		}else if(key == "r"){
			rname = decodeURI(value)
		}
	}
	var item = aaindexGet(indexes)
	if(!item || (rname && item.r != rname)){
		/* bad indexes */
		if(rname){
			var rightIndexes = findIndexesByName(rname)
			if(rightIndexes){
				var rightURI = mltURI(indexesToString(rightIndexes), rname)
				location.assign(rightURI)
			}
		}
	}else{
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

if(inIE){
	var script = document.createElement("script")
	script.setAttribute("type", "text/vbscript")
	script.setAttribute("src", "mlt-ie.vbs")
	var head = document.getElementsByTagName("head")[0]
	head.appendChild(script)
}

fixStylesheet("mlt-old.css")
