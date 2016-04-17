#!/usr/bin/env python

import os, stat, sys, codecs, unicodedata

# settings

HukuTemp_dir = u"../HukuTemp"

# read directories

def is_split_char(base, name):
	s = os.path.splitext(name)[0]
	base_len = len(base)
	return base_len <= len(s) and s[0 : base_len] == base

def read_dir(path, level):
	list = []
	all_split = level >= 2
	for i in os.listdir(os.path.join(HukuTemp_dir, path)):
		if i[0] == u'.': continue
		if level == 0 and (i == "read me.txt" or i == "index.csv"): continue
		ni = unicodedata.normalize("NFC", i)
		rname = os.path.join(path, ni)
		all_split = all_split and is_split_char(os.path.basename(path), i)
		fname = os.path.join(HukuTemp_dir, rname)
		if os.path.isdir(fname):
			child_info = read_dir(rname, level + 1)
			list.append((rname, child_info))
		else:
			list.append((rname, None))
	return (list, all_split)

info = read_dir(u"", 0)

write = sys.stdout.write

def write_index(list, level):
	write("[")
	first = True
	for (name, info) in list:
		if not first: write(",")
		write("\n")
		write(level * ' ')
		write("{r: \"")
		write(name.encode("unicode_escape"))
		write("\"")
		if info:
			write(", ")
			write("s" if info[1] else "l")
			write(": ")
			write_index(info[0], level + 1)
		write("}")
		first = False
	write("]")

write("var aaindex = ")
write_index (info[0], 1)
write(";\n")
