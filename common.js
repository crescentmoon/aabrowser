/* for index.html and mlt.html */

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
