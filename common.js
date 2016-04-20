/* for index.html and mlt.html */

function indexesToString(indexes){
	var result = ""
	for(var i = 0; i < indexes.length; ++i){
		if(result != ""){
			result = result + "_"
		}
		result = result + indexes[i].toString()
	}
	return result
}

function mltURI(indexesString, name){
	return "mlt.html?i=" + indexesString + "&r=" + encodeURI(name)
}

function titleOfFilename(name){
	var result = name
	var i = result.lastIndexOf("/")
	if(i >= 0){
		result = result.slice(i + 1)
	}
	if(result.length >= 4 && result.slice(result.length - 4) == ".mlt"){
		result = result.slice(0, result.length - 4)
	}
	return result
}

var inIE =
	navigator.userAgent.search(/MSIE 8\.[0-9\.]*; Windows/) >= 0 /* IE 8 */

function fixStylesheet(src){
	var ua = navigator.userAgent
//	console.log(ua)
	if(ua.search(/Version\/5\.[0-9\.]* Safari\/5/) >= 0){ /* Safari 5 */
		var link = document.createElement('link')
		link.setAttribute("rel", "stylesheet")
		link.setAttribute("type", "text/css")
		link.setAttribute("href", src)
		var head = document.getElementsByTagName('head')[0]
		head.appendChild(link)
	}else if(inIE){
		var link = "<link rel=\"stylesheet\" type=\"text/css\" href=\""
		           + src
		           + "\">"
		document.write(link)
	}
}
