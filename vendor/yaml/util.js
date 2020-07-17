/**
 * yaml
 * 1.10.0
 * https://github.com/eemeli/yaml
 *
 * Copyright 2018 Eemeli Aro <eemeli@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */
'use strict';

var PlainValue = require('./PlainValue-ec8e588e.js');
var resolveSeq = require('./resolveSeq-4a68b39b.js');



exports.Type = PlainValue.Type;
exports.YAMLError = PlainValue.YAMLError;
exports.YAMLReferenceError = PlainValue.YAMLReferenceError;
exports.YAMLSemanticError = PlainValue.YAMLSemanticError;
exports.YAMLSyntaxError = PlainValue.YAMLSyntaxError;
exports.YAMLWarning = PlainValue.YAMLWarning;
exports.findPair = resolveSeq.findPair;
exports.parseMap = resolveSeq.resolveMap;
exports.parseSeq = resolveSeq.resolveSeq;
exports.stringifyNumber = resolveSeq.stringifyNumber;
exports.stringifyString = resolveSeq.stringifyString;
exports.toJSON = resolveSeq.toJSON;
