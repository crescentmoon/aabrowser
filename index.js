/* for index.html */

var selectedFolders = []
var folderMap = []

function levelOfPain(pain){
	return parseInt(pain.id.slice(4)) /* skip "pain" */
}

function folderClass(level, selected){
	var result = "folder level" + level.toString()
	if(selected){
		result = "selected " + result
	}
	return result
}

function removePain(level){
	var pain
	while(pain = document.getElementById("pain" + level.toString())){
		document.getElementById("root").removeChild(pain)
	}
}

function makePain(level){
	removePain(level + 1)
	var id = "pain" + level.toString()
	var pain = document.getElementById(id)
	if(!pain){
		pain = document.createElement("div")
		pain.setAttribute("id", id)
		pain.setAttribute("class", "pain level" + level.toString())
		document.getElementById("root").appendChild(pain)
	}
	return pain
}

function makeFolder(indexes, pain, list){
	while(pain.lastChild){
		pain.removeChild(pain.lastChild)
	}
	var level = levelOfPain(pain)
	for(var i = 0; i < list.length; ++i){
		var itemIndexes = indexes.concat([i])
		var rname = list[i].r
		var id = indexesToString(itemIndexes)
		var o = document.createElement("div")
		o.setAttribute("id", id)
		if(list[i].l){ /* folder */
			o.setAttribute("class", folderClass(level, false))
			o.setAttribute("onclick", "expandFolder(document.getElementById(\"" + id + "\"))")
			o.appendChild(document.createTextNode(titleOfFilename(rname)))
			if(!folderMap[id]){
				var item = list[i]
				item.indexes = itemIndexes
				folderMap[id] = item
			}
		}else{ /* mlt */
			o.setAttribute("class", "file level" + level.toString())
			var a = document.createElement("a")
			a.setAttribute("target", rname)
			a.setAttribute("href", mltURI(id, rname))
			a.appendChild(document.createTextNode(titleOfFilename(rname)))
			o.appendChild(a)
		}
		pain.appendChild(o)
	}
}

function expandFolder(node){
	var level = levelOfPain(node.parentNode)
	var pain = makePain(level + 1)
	var item = folderMap[node.id]
	makeFolder(item.indexes, pain, item.l)
	var prev = selectedFolders[level]
	if(prev !== node){
		if(prev){
			prev.setAttribute("class", folderClass(level, false))
		}
		node.setAttribute("class", folderClass(level, true))
		selectedFolders[level] = node
	}
}

function do_onload(){
	var pain = makePain(1)
	makeFolder([], pain, aaindex)
}

fixStylesheet("index-old.css")
