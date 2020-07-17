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

require('./PlainValue-ec8e588e.js');
require('./resolveSeq-4a68b39b.js');
var warnings = require('./warnings-39684f17.js');



exports.binary = warnings.binary;
exports.floatTime = warnings.floatTime;
exports.intTime = warnings.intTime;
exports.omap = warnings.omap;
exports.pairs = warnings.pairs;
exports.set = warnings.set;
exports.timestamp = warnings.timestamp;
exports.warnFileDeprecation = warnings.warnFileDeprecation;
