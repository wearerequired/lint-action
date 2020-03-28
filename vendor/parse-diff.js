/**
 * parse-diff v0.6.0
 * Simple unified diff parser for nodejs
 * https://github.com/sergeyt/parse-diff
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Sergey Todyshev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* eslint-disable */

var defaultToWhiteSpace,
	escapeRegExp,
	ltrim,
	makeString,
	parseFile,
	parseFileFallback,
	trimLeft,
	slice = [].slice;

module.exports = function (input) {
	var add,
		chunk,
		current,
		del,
		deleted_file,
		eof,
		file,
		files,
		from_file,
		index,
		j,
		len,
		line,
		lines,
		ln_add,
		ln_del,
		new_file,
		normal,
		parse,
		restart,
		schema,
		start,
		to_file;
	if (!input) {
		return [];
	}
	if (input.match(/^\s+$/)) {
		return [];
	}
	lines = input.split("\n");
	if (lines.length === 0) {
		return [];
	}
	files = [];
	file = null;
	ln_del = 0;
	ln_add = 0;
	current = null;
	start = function (line) {
		var fileNames;
		file = {
			chunks: [],
			deletions: 0,
			additions: 0,
		};
		files.push(file);
		if (!file.to && !file.from) {
			fileNames = parseFile(line);
			if (fileNames) {
				file.from = fileNames[0];
				return (file.to = fileNames[1]);
			}
		}
	};
	restart = function () {
		if (!file || file.chunks.length) {
			return start();
		}
	};
	new_file = function () {
		restart();
		file.new = true;
		return (file.from = "/dev/null");
	};
	deleted_file = function () {
		restart();
		file.deleted = true;
		return (file.to = "/dev/null");
	};
	index = function (line) {
		restart();
		return (file.index = line.split(" ").slice(1));
	};
	from_file = function (line) {
		restart();
		return (file.from = parseFileFallback(line));
	};
	to_file = function (line) {
		restart();
		return (file.to = parseFileFallback(line));
	};
	chunk = function (line, match) {
		var newLines, newStart, oldLines, oldStart;
		ln_del = oldStart = +match[1];
		oldLines = +(match[2] || 1);
		ln_add = newStart = +match[3];
		newLines = +(match[4] || 1);
		current = {
			content: line,
			changes: [],
			oldStart,
			oldLines,
			newStart,
			newLines,
		};
		return file.chunks.push(current);
	};
	del = function (line) {
		if (!current) {
			return;
		}
		current.changes.push({
			type: "del",
			del: true,
			ln: ln_del++,
			content: line,
		});
		return file.deletions++;
	};
	add = function (line) {
		if (!current) {
			return;
		}
		current.changes.push({
			type: "add",
			add: true,
			ln: ln_add++,
			content: line,
		});
		return file.additions++;
	};
	normal = function (line) {
		if (!current) {
			return;
		}
		return current.changes.push({
			type: "normal",
			normal: true,
			ln1: ln_del++,
			ln2: ln_add++,
			content: line,
		});
	};
	eof = function (line) {
		var recentChange, ref;
		(ref = current.changes), ([recentChange] = slice.call(ref, -1));
		return current.changes.push({
			type: recentChange.type,
			[`${recentChange.type}`]: true,
			ln1: recentChange.ln1,
			ln2: recentChange.ln2,
			ln: recentChange.ln,
			content: line,
		});
	};
	// todo beter regexp to avoid detect normal line starting with diff
	schema = [
		[/^\s+/, normal],
		[/^diff\s/, start],
		[/^new file mode \d+$/, new_file],
		[/^deleted file mode \d+$/, deleted_file],
		[/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/, index],
		[/^---\s/, from_file],
		[/^\+\+\+\s/, to_file],
		[/^@@\s+\-(\d+),?(\d+)?\s+\+(\d+),?(\d+)?\s@@/, chunk],
		[/^-/, del],
		[/^\+/, add],
		[/^\\ No newline at end of file$/, eof],
	];
	parse = function (line) {
		var j, len, m, p;
		for (j = 0, len = schema.length; j < len; j++) {
			p = schema[j];
			m = line.match(p[0]);
			if (m) {
				p[1](line, m);
				return true;
			}
		}
		return false;
	};
	for (j = 0, len = lines.length; j < len; j++) {
		line = lines[j];
		parse(line);
	}
	return files;
};

parseFile = function (s) {
	var fileNames;
	if (!s) {
		return;
	}
	fileNames = s.match(/a\/.*(?= b)|b\/.*$/g);
	fileNames.map(function (fileName, i) {
		return (fileNames[i] = fileName.replace(/^(a|b)\//, ""));
	});
	return fileNames;
};

// fallback function to overwrite file.from and file.to if executed
parseFileFallback = function (s) {
	var t;
	s = ltrim(s, "-");
	s = ltrim(s, "+");
	s = s.trim();
	// ignore possible time stamp
	t = /\t.*|\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/.exec(s);
	if (t) {
		s = s.substring(0, t.index).trim();
	}
	// ignore git prefixes a/ or b/
	if (s.match(/^(a|b)\//)) {
		return s.substr(2);
	} else {
		return s;
	}
};

ltrim = function (s, chars) {
	s = makeString(s);
	if (!chars && trimLeft) {
		return trimLeft.call(s);
	}
	chars = defaultToWhiteSpace(chars);
	return s.replace(new RegExp("^" + chars + "+"), "");
};

makeString = function (s) {
	if (s === null) {
		return "";
	} else {
		return s + "";
	}
};

trimLeft = String.prototype.trimLeft;

defaultToWhiteSpace = function (chars) {
	if (chars === null) {
		return "\\s";
	}
	if (chars.source) {
		return chars.source;
	}
	return "[" + escapeRegExp(chars) + "]";
};

escapeRegExp = function (s) {
	return makeString(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
};
