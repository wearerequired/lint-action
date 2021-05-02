/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 241:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(241);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 569:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(325);


/***/ }),

/***/ 325:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var exec = __nccwpck_require__(129).exec;
var execSync = __nccwpck_require__(129).execSync;
var fs = __nccwpck_require__(747);
var path = __nccwpck_require__(622);
var access = fs.access;
var accessSync = fs.accessSync;
var constants = fs.constants || fs;

var isUsingWindows = process.platform == 'win32'

var fileNotExists = function(commandName, callback){
    access(commandName, constants.F_OK,
    function(err){
        callback(!err);
    });
};

var fileNotExistsSync = function(commandName){
    try{
        accessSync(commandName, constants.F_OK);
        return false;
    }catch(e){
        return true;
    }
};

var localExecutable = function(commandName, callback){
    access(commandName, constants.F_OK | constants.X_OK,
        function(err){
        callback(null, !err);
    });
};

var localExecutableSync = function(commandName){
    try{
        accessSync(commandName, constants.F_OK | constants.X_OK);
        return true;
    }catch(e){
        return false;
    }
}

var commandExistsUnix = function(commandName, cleanedCommandName, callback) {

    fileNotExists(commandName, function(isFile){

        if(!isFile){
            var child = exec('command -v ' + cleanedCommandName +
                  ' 2>/dev/null' +
                  ' && { echo >&1 ' + cleanedCommandName + '; exit 0; }',
                  function (error, stdout, stderr) {
                      callback(null, !!stdout);
                  });
            return;
        }

        localExecutable(commandName, callback);
    });

}

var commandExistsWindows = function(commandName, cleanedCommandName, callback) {
  // Regex from Julio from: https://stackoverflow.com/questions/51494579/regex-windows-path-validator
  if (!(/^(?!(?:.*\s|.*\.|\W+)$)(?:[a-zA-Z]:)?(?:(?:[^<>:"\|\?\*\n])+(?:\/\/|\/|\\\\|\\)?)+$/m.test(commandName))) {
    callback(null, false);
    return;
  }
  var child = exec('where ' + cleanedCommandName,
    function (error) {
      if (error !== null){
        callback(null, false);
      } else {
        callback(null, true);
      }
    }
  )
}

var commandExistsUnixSync = function(commandName, cleanedCommandName) {
  if(fileNotExistsSync(commandName)){
      try {
        var stdout = execSync('command -v ' + cleanedCommandName +
              ' 2>/dev/null' +
              ' && { echo >&1 ' + cleanedCommandName + '; exit 0; }'
              );
        return !!stdout;
      } catch (error) {
        return false;
      }
  }
  return localExecutableSync(commandName);
}

var commandExistsWindowsSync = function(commandName, cleanedCommandName, callback) {
  // Regex from Julio from: https://stackoverflow.com/questions/51494579/regex-windows-path-validator
  if (!(/^(?!(?:.*\s|.*\.|\W+)$)(?:[a-zA-Z]:)?(?:(?:[^<>:"\|\?\*\n])+(?:\/\/|\/|\\\\|\\)?)+$/m.test(commandName))) {
    return false;
  }
  try {
      var stdout = execSync('where ' + cleanedCommandName, {stdio: []});
      return !!stdout;
  } catch (error) {
      return false;
  }
}

var cleanInput = function(s) {
  if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
    s = "'"+s.replace(/'/g,"'\\''")+"'";
    s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
      .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
  }
  return s;
}

if (isUsingWindows) {
  cleanInput = function(s) {
    var isPathName = /[\\]/.test(s);
    if (isPathName) {
      var dirname = '"' + path.dirname(s) + '"';
      var basename = '"' + path.basename(s) + '"';
      return dirname + ':' + basename;
    }
    return '"' + s + '"';
  }
}

module.exports = function commandExists(commandName, callback) {
  var cleanedCommandName = cleanInput(commandName);
  if (!callback && typeof Promise !== 'undefined') {
    return new Promise(function(resolve, reject){
      commandExists(commandName, function(error, output) {
        if (output) {
          resolve(commandName);
        } else {
          reject(error);
        }
      });
    });
  }
  if (isUsingWindows) {
    commandExistsWindows(commandName, cleanedCommandName, callback);
  } else {
    commandExistsUnix(commandName, cleanedCommandName, callback);
  }
};

module.exports.sync = function(commandName) {
  var cleanedCommandName = cleanInput(commandName);
  if (isUsingWindows) {
    return commandExistsWindowsSync(commandName, cleanedCommandName);
  } else {
    return commandExistsUnixSync(commandName, cleanedCommandName);
  }
};


/***/ }),

/***/ 833:
/***/ ((module) => {

"use strict";
function _createForOfIteratorHelper(o,allowArrayLike){var it;if(typeof Symbol==="undefined"||o[Symbol.iterator]==null){if(Array.isArray(o)||(it=_unsupportedIterableToArray(o))||allowArrayLike&&o&&typeof o.length==="number"){if(it)o=it;var i=0;var F=function F(){};return{s:F,n:function n(){if(i>=o.length)return{done:true};return{done:false,value:o[i++]}},e:function e(_e2){throw _e2},f:F}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var normalCompletion=true,didErr=false,err;return{s:function s(){it=o[Symbol.iterator]()},n:function n(){var step=it.next();normalCompletion=step.done;return step},e:function e(_e3){didErr=true;err=_e3},f:function f(){try{if(!normalCompletion&&it["return"]!=null)it["return"]()}finally{if(didErr)throw err}}}}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}function _slicedToArray(arr,i){return _arrayWithHoles(arr)||_iterableToArrayLimit(arr,i)||_unsupportedIterableToArray(arr,i)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i]}return arr2}function _iterableToArrayLimit(arr,i){if(typeof Symbol==="undefined"||!(Symbol.iterator in Object(arr)))return;var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i["return"]!=null)_i["return"]()}finally{if(_d)throw _e}}return _arr}function _arrayWithHoles(arr){if(Array.isArray(arr))return arr}module.exports=function(input){if(!input)return[];if(typeof input!=="string"||input.match(/^\s+$/))return[];var lines=input.split("\n");if(lines.length===0)return[];var files=[];var currentFile=null;var currentChunk=null;var deletedLineCounter=0;var addedLineCounter=0;var normal=function normal(line){var _currentChunk;(_currentChunk=currentChunk)===null||_currentChunk===void 0?void 0:_currentChunk.changes.push({type:"normal",normal:true,ln1:deletedLineCounter++,ln2:addedLineCounter++,content:line})};var start=function start(line){var _parseFiles;var _ref=(_parseFiles=parseFiles(line))!==null&&_parseFiles!==void 0?_parseFiles:[],_ref2=_slicedToArray(_ref,2),fromFileName=_ref2[0],toFileName=_ref2[1];currentFile={chunks:[],deletions:0,additions:0,from:fromFileName,to:toFileName};files.push(currentFile)};var restart=function restart(){if(!currentFile||currentFile.chunks.length)start()};var newFile=function newFile(){restart();currentFile["new"]=true;currentFile.from="/dev/null"};var deletedFile=function deletedFile(){restart();currentFile.deleted=true;currentFile.to="/dev/null"};var index=function index(line){restart();currentFile.index=line.split(" ").slice(1)};var fromFile=function fromFile(line){restart();currentFile.from=parseOldOrNewFile(line)};var toFile=function toFile(line){restart();currentFile.to=parseOldOrNewFile(line)};var chunk=function chunk(line,match){if(!currentFile)return;var _match$slice=match.slice(1),_match$slice2=_slicedToArray(_match$slice,4),oldStart=_match$slice2[0],oldNumLines=_match$slice2[1],newStart=_match$slice2[2],newNumLines=_match$slice2[3];deletedLineCounter=+oldStart;addedLineCounter=+newStart;currentChunk={content:line,changes:[],oldStart:+oldStart,oldLines:+(oldNumLines||1),newStart:+newStart,newLines:+(newNumLines||1)};currentFile.chunks.push(currentChunk)};var del=function del(line){if(!currentChunk)return;currentChunk.changes.push({type:"del",del:true,ln:deletedLineCounter++,content:line});currentFile.deletions++};var add=function add(line){if(!currentChunk)return;currentChunk.changes.push({type:"add",add:true,ln:addedLineCounter++,content:line});currentFile.additions++};var eof=function eof(line){var _currentChunk$changes3;if(!currentChunk)return;var _currentChunk$changes=currentChunk.changes.slice(-1),_currentChunk$changes2=_slicedToArray(_currentChunk$changes,1),mostRecentChange=_currentChunk$changes2[0];currentChunk.changes.push((_currentChunk$changes3={type:mostRecentChange.type},_defineProperty(_currentChunk$changes3,mostRecentChange.type,true),_defineProperty(_currentChunk$changes3,"ln1",mostRecentChange.ln1),_defineProperty(_currentChunk$changes3,"ln2",mostRecentChange.ln2),_defineProperty(_currentChunk$changes3,"ln",mostRecentChange.ln),_defineProperty(_currentChunk$changes3,"content",line),_currentChunk$changes3))};var schema=[// TODO: better regexp to avoid detect normal line starting with diff
[/^\s+/,normal],[/^diff\s/,start],[/^new file mode \d+$/,newFile],[/^deleted file mode \d+$/,deletedFile],[/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/,index],[/^---\s/,fromFile],[/^\+\+\+\s/,toFile],[/^@@\s+-(\d+),?(\d+)?\s+\+(\d+),?(\d+)?\s@@/,chunk],[/^-/,del],[/^\+/,add],[/^\\ No newline at end of file$/,eof]];var parseLine=function parseLine(line){var _iterator=_createForOfIteratorHelper(schema),_step;try{for(_iterator.s();!(_step=_iterator.n()).done;){var _step$value=_slicedToArray(_step.value,2),pattern=_step$value[0],handler=_step$value[1];var match=line.match(pattern);if(match){handler(line,match);return true}}}catch(err){_iterator.e(err)}finally{_iterator.f()}return false};var _iterator2=_createForOfIteratorHelper(lines),_step2;try{for(_iterator2.s();!(_step2=_iterator2.n()).done;){var line=_step2.value;parseLine(line)}}catch(err){_iterator2.e(err)}finally{_iterator2.f()}return files};var fileNameDiffRegex=/a\/.*(?=["']? ["']?b\/)|b\/.*$/g;var gitFileHeaderRegex=/^(a|b)\//;var parseFiles=function parseFiles(line){var fileNames=line===null||line===void 0?void 0:line.match(fileNameDiffRegex);return fileNames===null||fileNames===void 0?void 0:fileNames.map(function(fileName){return fileName.replace(gitFileHeaderRegex,"").replace(/("|')$/,"")})};var qoutedFileNameRegex=/^\\?['"]|\\?['"]$/g;var parseOldOrNewFile=function parseOldOrNewFile(line){var fileName=leftTrimChars(line,"-+").trim();fileName=removeTimeStamp(fileName);return fileName.replace(qoutedFileNameRegex,"").replace(gitFileHeaderRegex,"")};var leftTrimChars=function leftTrimChars(string,trimmingChars){string=makeString(string);if(!trimmingChars&&String.prototype.trimLeft)return string.trimLeft();var trimmingString=formTrimmingString(trimmingChars);return string.replace(new RegExp("^".concat(trimmingString,"+")),"")};var timeStampRegex=/\t.*|\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/;var removeTimeStamp=function removeTimeStamp(string){var timeStamp=timeStampRegex.exec(string);if(timeStamp){string=string.substring(0,timeStamp.index).trim()}return string};var formTrimmingString=function formTrimmingString(trimmingChars){if(trimmingChars===null||trimmingChars===undefined)return"\\s";else if(trimmingChars instanceof RegExp)return trimmingChars.source;return"[".concat(makeString(trimmingChars).replace(/([.*+?^=!:${}()|[\]/\\])/g,"\\$1"),"]")};var makeString=function makeString(itemToConvert){return(itemToConvert!==null&&itemToConvert!==void 0?itemToConvert:"")+""};


/***/ }),

/***/ 109:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(186);

const { run } = __nccwpck_require__(575);

/**
 * Fetches and checks out the remote Git branch (if it exists, the fork repository will be used)
 * @param {import('./github/context').GithubContext} context - Information about the GitHub
 */
function checkOutRemoteBranch(context) {
	if (context.repository.hasFork) {
		// Fork: Add fork repo as remote
		core.info(`Adding "${context.repository.forkName}" fork as remote with Git`);
		run(
			`git remote add fork https://${context.actor}:${context.token}@github.com/${context.repository.forkName}.git`,
		);
	} else {
		// No fork: Update remote URL to include auth information (so auto-fixes can be pushed)
		core.info(`Adding auth information to Git remote URL`);
		run(
			`git remote set-url origin https://${context.actor}:${context.token}@github.com/${context.repository.repoName}.git`,
		);
	}

	const remote = context.repository.hasFork ? "fork" : "origin";

	// Fetch remote branch
	core.info(`Fetching remote branch "${context.branch}"`);
	run(`git fetch --no-tags --depth=1 ${remote} ${context.branch}`);

	// Switch to remote branch
	core.info(`Switching to the "${context.branch}" branch`);
	run(`git branch --force ${context.branch} --track ${remote}/${context.branch}`);
	run(`git checkout ${context.branch}`);
}

/**
 * Stages and commits all changes using Git
 * @param {string} message - Git commit message
 */
function commitChanges(message) {
	core.info(`Committing changes`);
	run(`git commit -am "${message}"`);
}

/**
 * Returns the SHA of the head commit
 * @returns {string} - Head SHA
 */
function getHeadSha() {
	const sha = run("git rev-parse HEAD").stdout;
	core.info(`SHA of last commit is "${sha}"`);
	return sha;
}

/**
 * Checks whether there are differences from HEAD
 * @returns {boolean} - Boolean indicating whether changes exist
 */
function hasChanges() {
	const output = run("git diff-index --name-status --exit-code HEAD --", { ignoreErrors: true });
	const hasChangedFiles = output.status === 1;
	core.info(`${hasChangedFiles ? "Changes" : "No changes"} found with Git`);
	return hasChangedFiles;
}

/**
 * Pushes all changes to the remote repository
 */
function pushChanges() {
	core.info("Pushing changes with Git");
	run("git push");
}

/**
 * Updates the global Git configuration with the provided information
 * @param {string} name - Git username
 * @param {string} email - Git email address
 */
function setUserInfo(name, email) {
	core.info(`Setting Git user information`);
	run(`git config --global user.name "${name}"`);
	run(`git config --global user.email "${email}"`);
}

module.exports = {
	checkOutRemoteBranch,
	commitChanges,
	getHeadSha,
	hasChanges,
	pushChanges,
	setUserInfo,
};


/***/ }),

/***/ 872:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(186);

const { name: actionName } = __nccwpck_require__(306);
const request = __nccwpck_require__(408);
const { capitalizeFirstLetter } = __nccwpck_require__(321);

/**
 * Creates a new check on GitHub which annotates the relevant commit with linting errors
 * @param {string} linterName - Name of the linter for which a check should be created
 * @param {string} sha - SHA of the commit which should be annotated
 * @param {import('./context').GithubContext} context - Information about the GitHub repository and
 * action trigger event
 * @param {import('../utils/lint-result').LintResult} lintResult - Parsed lint result
 * @param {string} summary - Summary for the GitHub check
 */
async function createCheck(linterName, sha, context, lintResult, summary) {
	let annotations = [];
	for (const level of ["warning", "error"]) {
		annotations = [
			...annotations,
			...lintResult[level].map((result) => ({
				path: result.path,
				start_line: result.firstLine,
				end_line: result.lastLine,
				annotation_level: level === "warning" ? "warning" : "failure",
				message: result.message,
			})),
		];
	}

	// Only use the first 50 annotations (limit for a single API request)
	if (annotations.length > 50) {
		core.info(
			`There are more than 50 errors/warnings from ${linterName}. Annotations are created for the first 50 issues only.`,
		);
		annotations = annotations.slice(0, 50);
	}

	const body = {
		name: linterName,
		head_sha: sha,
		conclusion: lintResult.isSuccess ? "success" : "failure",
		output: {
			title: capitalizeFirstLetter(summary),
			summary: `${linterName} found ${summary}`,
			annotations,
		},
	};
	try {
		core.info(`Creating GitHub check with ${annotations.length} annotations for ${linterName}…`);
		await request(`https://api.github.com/repos/${context.repository.repoName}/check-runs`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// "Accept" header is required to access Checks API during preview period
				Accept: "application/vnd.github.antiope-preview+json",
				Authorization: `Bearer ${context.token}`,
				"User-Agent": actionName,
			},
			body,
		});
		core.info(`${linterName} check created successfully`);
	} catch (err) {
		core.error(err);
		throw new Error(`Error trying to create GitHub check for ${linterName}: ${err.message}`);
	}
}

module.exports = { createCheck };


/***/ }),

/***/ 476:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { readFileSync } = __nccwpck_require__(747);

const core = __nccwpck_require__(186);

const { name: actionName } = __nccwpck_require__(306);
const { getEnv } = __nccwpck_require__(575);

/**
 * GitHub Actions workflow's environment variables
 * @typedef {{actor: string, eventName: string, eventPath: string, token: string, workspace:
 * string}} ActionEnv
 */

/**
 * Information about the GitHub repository and its fork (if it exists)
 * @typedef {{repoName: string, forkName: string, hasFork: boolean}} GithubRepository
 */

/**
 * Information about the GitHub repository and action trigger event
 * @typedef {{actor: string, branch: string, event: object, eventName: string, repository:
 * GithubRepository, token: string, workspace: string}} GithubContext
 */

/**
 * Returns the GitHub Actions workflow's environment variables
 * @returns {ActionEnv} GitHub Actions workflow's environment variables
 */
function parseActionEnv() {
	return {
		// Information provided by environment
		actor: getEnv("github_actor", true),
		eventName: getEnv("github_event_name", true),
		eventPath: getEnv("github_event_path", true),
		workspace: getEnv("github_workspace", true),

		// Information provided by action user
		token: core.getInput("github_token", { required: true }),
	};
}

/**
 * Parse `event.json` file (file with the complete webhook event payload, automatically provided by
 * GitHub)
 * @param {string} eventPath - Path to the `event.json` file
 * @returns {object} - Webhook event payload
 */
function parseEnvFile(eventPath) {
	const eventBuffer = readFileSync(eventPath);
	return JSON.parse(eventBuffer);
}

/**
 * Parses the name of the current branch from the GitHub webhook event
 * @param {string} eventName - GitHub event type
 * @param {object} event - GitHub webhook event payload
 * @returns {string} - Branch name
 */
function parseBranch(eventName, event) {
	if (eventName === "push" || eventName === "workflow_dispatch") {
		return event.ref.substring(11); // Remove "refs/heads/" from start of string
	}
	if (eventName === "pull_request" || eventName === "pull_request_target") {
		return event.pull_request.head.ref;
	}
	throw Error(`${actionName} does not support "${eventName}" GitHub events`);
}

/**
 * Parses the name of the current repository and determines whether it has a corresponding fork.
 * Fork detection is only supported for the "pull_request" event
 * @param {string} eventName - GitHub event type
 * @param {object} event - GitHub webhook event payload
 * @returns {GithubRepository} - Information about the GitHub repository and its fork (if it exists)
 */
function parseRepository(eventName, event) {
	const repoName = event.repository.full_name;
	let forkName;
	if (eventName === "pull_request" || eventName === "pull_request_target") {
		// "pull_request" events are triggered on the repository where the PR is made. The PR branch can
		// be on the same repository (`forkRepository` is set to `null`) or on a fork (`forkRepository`
		// is defined)
		const headRepoName = event.pull_request.head.repo.full_name;
		forkName = repoName === headRepoName ? undefined : headRepoName;
	}
	return {
		repoName,
		forkName,
		hasFork: forkName != null && forkName !== repoName,
	};
}

/**
 * Returns information about the GitHub repository and action trigger event
 * @returns {GithubContext} context - Information about the GitHub repository and action trigger
 * event
 */
function getContext() {
	const { actor, eventName, eventPath, token, workspace } = parseActionEnv();
	const event = parseEnvFile(eventPath);
	return {
		actor,
		branch: parseBranch(eventName, event),
		event,
		eventName,
		repository: parseRepository(eventName, event),
		token,
		workspace,
	};
}

module.exports = {
	getContext,
	parseActionEnv,
	parseBranch,
	parseEnvFile,
	parseRepository,
};


/***/ }),

/***/ 844:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { parseErrorsFromDiff } = __nccwpck_require__(388);
const { initLintResult } = __nccwpck_require__(149);

/**
 * https://black.readthedocs.io
 */
class Black {
	static get name() {
		return "Black";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that Python is installed (required to execute Black)
		if (!(await commandExists("python"))) {
			throw new Error("Python is not installed");
		}

		// Verify that Black is installed
		try {
			run(`${prefix} black --version`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		const files = `^.*\\.(${extensions.join("|")})$`;
		const fixArg = fix ? "" : "--check --diff";
		return run(`${prefix} black ${fixArg} --include "${files}" ${args} "."`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.error = parseErrorsFromDiff(output.stdout);
		lintResult.isSuccess = output.status === 0;
		return lintResult;
	}
}

module.exports = Black;


/***/ }),

/***/ 169:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);
const { getNpmBinCommand } = __nccwpck_require__(838);
const { removeTrailingPeriod } = __nccwpck_require__(321);

/**
 * https://eslint.org
 */
class ESLint {
	static get name() {
		return "ESLint";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that NPM is installed (required to execute ESLint)
		if (!(await commandExists("npm"))) {
			throw new Error("NPM is not installed");
		}

		// Verify that ESLint is installed
		const commandPrefix = prefix || getNpmBinCommand(dir);
		try {
			run(`${commandPrefix} eslint -v`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		const extensionsArg = extensions.map((ext) => `.${ext}`).join(",");
		const fixArg = fix ? "--fix" : "";
		const commandPrefix = prefix || getNpmBinCommand(dir);
		return run(
			`${commandPrefix} eslint --ext ${extensionsArg} ${fixArg} --no-color --format json ${args} "."`,
			{
				dir,
				ignoreErrors: true,
			},
		);
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		let outputJson;
		try {
			outputJson = JSON.parse(output.stdout);
		} catch (err) {
			throw Error(
				`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
			);
		}

		for (const violation of outputJson) {
			const { filePath, messages } = violation;
			const path = filePath.substring(dir.length + 1);

			for (const msg of messages) {
				const { fatal, line, message, ruleId, severity } = msg;

				// Exit if a fatal ESLint error occurred
				if (fatal) {
					throw Error(`ESLint error: ${message}`);
				}

				const entry = {
					path,
					firstLine: line,
					lastLine: line,
					message: `${removeTrailingPeriod(message)} (${ruleId})`,
				};
				if (severity === 1) {
					lintResult.warning.push(entry);
				} else if (severity === 2) {
					lintResult.error.push(entry);
				}
			}
		}

		return lintResult;
	}
}

module.exports = ESLint;


/***/ }),

/***/ 636:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { sep } = __nccwpck_require__(622);

const core = __nccwpck_require__(186);

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);
const { capitalizeFirstLetter } = __nccwpck_require__(321);

const PARSE_REGEX = /^(.*):([0-9]+):[0-9]+: (\w*) (.*)$/gm;

/**
 * http://flake8.pycqa.org
 */
class Flake8 {
	static get name() {
		return "Flake8";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that Python is installed (required to execute Flake8)
		if (!(await commandExists("python"))) {
			throw new Error("Python is not installed");
		}

		// Verify that Flake8 is installed
		try {
			run(`${prefix} flake8 --version`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}

		const files = extensions.map((ext) => `"**${sep}*.${ext}"`).join(",");
		return run(`${prefix} flake8 --filename ${files} ${args}`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		const matches = output.stdout.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, pathFull, line, rule, text] = match;
			const leadingSep = `.${sep}`;
			let path = pathFull;
			if (path.startsWith(leadingSep)) {
				path = path.substring(2); // Remove "./" or ".\" from start of path
			}
			const lineNr = parseInt(line, 10);
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: `${capitalizeFirstLetter(text)} (${rule})`,
			});
		}

		return lintResult;
	}
}

module.exports = Flake8;


/***/ }),

/***/ 796:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { parseErrorsFromDiff } = __nccwpck_require__(388);
const { initLintResult } = __nccwpck_require__(149);

/**
 * https://golang.org/cmd/gofmt
 */
class Gofmt {
	static get name() {
		return "gofmt";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that gofmt is installed
		if (!(await commandExists("gofmt"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "go") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		// -d: Display diffs instead of rewriting files
		// -e: Report all errors (not just the first 10 on different lines)
		// -s: Simplify code
		// -w: Write result to (source) file instead of stdout
		const fixArg = fix ? "-w" : "-d -e";
		return run(`${prefix} gofmt -s ${fixArg} ${args} "."`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();

		// The gofmt output lines starting with "diff" differ from the ones of tools like Git:
		//
		//   - gofmt: "diff -u file-old.txt file-new.txt"
		//   - Git: "diff --git a/file-old.txt b/file-new.txt"
		//
		// The diff parser relies on the "a/" and "b/" strings to be able to tell where file names
		// start. Without these strings, this would not be possible, because file names may include
		// spaces, which are not escaped in unified diffs. As a workaround, these lines are filtered out
		// from the gofmt diff so the diff parser can read the diff without errors
		const filteredOutput = output.stdout
			.split(/\r?\n/)
			.filter((line) => !line.startsWith("diff -u"))
			.join("\n");
		lintResult.error = parseErrorsFromDiff(filteredOutput);

		// gofmt exits with 0 even if there are formatting issues. Therefore, this function determines
		// the success of the linting process based on the number of parsed errors
		lintResult.isSuccess = lintResult.error.length === 0;

		return lintResult;
	}
}

module.exports = Gofmt;


/***/ }),

/***/ 658:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(186);

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);
const { capitalizeFirstLetter } = __nccwpck_require__(321);

const PARSE_REGEX = /^(.+):([0-9]+):[0-9]+: (.+)$/gm;

/**
 * https://github.com/golang/lint
 */
class Golint {
	static get name() {
		return "golint";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that golint is installed
		if (!(await commandExists("golint"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "go") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}

		return run(`${prefix} golint -set_exit_status ${args} "."`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		const matches = output.stdout.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, path, line, text] = match;
			const lineNr = parseInt(line, 10);
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: capitalizeFirstLetter(text),
			});
		}

		return lintResult;
	}
}

module.exports = Golint;


/***/ }),

/***/ 565:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Black = __nccwpck_require__(844);
const ESLint = __nccwpck_require__(169);
const Flake8 = __nccwpck_require__(636);
const Gofmt = __nccwpck_require__(796);
const Golint = __nccwpck_require__(658);
const Mypy = __nccwpck_require__(510);
const PHPCodeSniffer = __nccwpck_require__(405);
const Prettier = __nccwpck_require__(460);
const RuboCop = __nccwpck_require__(399);
const Stylelint = __nccwpck_require__(194);
const SwiftFormatLockwood = __nccwpck_require__(983);
const SwiftFormatOfficial = __nccwpck_require__(828);
const SwiftLint = __nccwpck_require__(439);
const XO = __nccwpck_require__(728);

const linters = {
	// Linters
	eslint: ESLint,
	flake8: Flake8,
	golint: Golint,
	mypy: Mypy,
	php_codesniffer: PHPCodeSniffer,
	rubocop: RuboCop,
	stylelint: Stylelint,
	swiftlint: SwiftLint,
	xo: XO,

	// Formatters (should be run after linters)
	black: Black,
	gofmt: Gofmt,
	prettier: Prettier,
	swift_format_lockwood: SwiftFormatLockwood,
	swift_format_official: SwiftFormatOfficial,

	// Alias of `swift_format_lockwood` (for backward compatibility)
	// TODO: Remove alias in v2
	swiftformat: SwiftFormatLockwood,
};

module.exports = linters;


/***/ }),

/***/ 510:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(747);
const { sep } = __nccwpck_require__(622);

const core = __nccwpck_require__(186);

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);

const PARSE_REGEX = /^(.*):([0-9]+): (\w*): (.*)$/gm;

/**
 * https://mypy.readthedocs.io/en/stable/
 */
class Mypy {
	static get name() {
		return "Mypy";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that Python is installed (required to execute Mypy)
		if (!(await commandExists("python"))) {
			throw new Error("Python is not installed");
		}

		// Verify that Mypy is installed
		if (!(await commandExists("mypy"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "py") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}

		let specifiedPath = false;
		// Check if they passed a directory as an arg
		for (const arg of args.split(" ")) {
			if (fs.existsSync(arg)) {
				specifiedPath = true;
				break;
			}
		}
		let extraArgs = "";
		if (!specifiedPath) {
			extraArgs = ` ${dir}`;
		}
		return run(`${prefix} mypy ${args}${extraArgs}`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		const matches = output.stdout.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, pathFull, line, level, text] = match;
			const leadingSep = `.${sep}`;
			let path = pathFull;
			if (path.startsWith(leadingSep)) {
				path = path.substring(2); // Remove "./" or ".\" from start of path
			}
			const lineNr = parseInt(line, 10);
			const result = {
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: text,
			};
			if (level === "error") {
				lintResult.error.push(result);
			} else if (level === "warning") {
				lintResult.warning.push(result);
			}
		}

		return lintResult;
	}
}

module.exports = Mypy;


/***/ }),

/***/ 405:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(186);

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);
const { removeTrailingPeriod } = __nccwpck_require__(321);

/**
 * https://github.com/squizlabs/PHP_CodeSniffer
 */
class PHPCodeSniffer {
	static get name() {
		return "PHP_CodeSniffer";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that PHP is installed (required to execute phpcs)
		if (!(await commandExists("php"))) {
			throw new Error("PHP is not installed");
		}

		// Verify that phpcs is installed
		try {
			run(`${prefix} phpcs --version`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		const extensionsArg = extensions.join(",");
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}

		return run(`${prefix} phpcs --extensions=${extensionsArg} --report=json -q ${args} "."`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		let outputJson;
		try {
			outputJson = JSON.parse(output.stdout);
		} catch (err) {
			throw Error(
				`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
			);
		}

		for (const [file, violations] of Object.entries(outputJson.files)) {
			const path = file.indexOf(dir) === 0 ? file.substring(dir.length + 1) : file;

			for (const msg of violations.messages) {
				const { line, message, source, type } = msg;

				const entry = {
					path,
					firstLine: line,
					lastLine: line,
					message: `${removeTrailingPeriod(message)} (${source})`,
				};
				if (type === "WARNING") {
					lintResult.warning.push(entry);
				} else if (type === "ERROR") {
					lintResult.error.push(entry);
				}
			}
		}

		return lintResult;
	}
}

module.exports = PHPCodeSniffer;


/***/ }),

/***/ 460:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);
const { getNpmBinCommand } = __nccwpck_require__(838);

/**
 * https://prettier.io
 */
class Prettier {
	static get name() {
		return "Prettier";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that NPM is installed (required to execute Prettier)
		if (!(await commandExists("npm"))) {
			throw new Error("NPM is not installed");
		}

		// Verify that Prettier is installed
		const commandPrefix = prefix || getNpmBinCommand(dir);
		try {
			run(`${commandPrefix} prettier -v`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		const files =
			extensions.length === 1 ? `**/*.${extensions[0]}` : `**/*.{${extensions.join(",")}}`;
		const fixArg = fix ? "--write" : "--list-different";
		const commandPrefix = prefix || getNpmBinCommand(dir);
		return run(`${commandPrefix} prettier ${fixArg} --no-color ${args} "${files}"`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;
		if (lintResult.isSuccess || !output) {
			return lintResult;
		}

		const paths = output.stdout.split(/\r?\n/);
		lintResult.error = paths.map((path) => ({
			path,
			firstLine: 1,
			lastLine: 1,
			message:
				"There are issues with this file's formatting, please run Prettier to fix the errors",
		}));

		return lintResult;
	}
}

module.exports = Prettier;


/***/ }),

/***/ 399:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);
const { removeTrailingPeriod } = __nccwpck_require__(321);

// Mapping of RuboCop severities to severities used for GitHub commit annotations
const severityMap = {
	convention: "warning",
	refactor: "warning",
	warning: "warning",
	error: "error",
	fatal: "error",
};

/**
 * https://rubocop.readthedocs.io
 */
class RuboCop {
	static get name() {
		return "RuboCop";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that Ruby is installed (required to execute RuboCop)
		if (!(await commandExists("ruby"))) {
			throw new Error("Ruby is not installed");
		}
		// Verify that RuboCop is installed
		try {
			run(`${prefix} rubocop -v`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "rb") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const fixArg = fix ? "--auto-correct" : "";
		return run(`${prefix} rubocop --format json ${fixArg} ${args}`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		let outputJson;
		try {
			outputJson = JSON.parse(output.stdout);
		} catch (err) {
			throw Error(
				`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
			);
		}

		for (const file of outputJson.files) {
			const { path, offenses } = file;
			for (const offense of offenses) {
				const { severity, message, cop_name: rule, corrected, location } = offense;
				if (!corrected) {
					const mappedSeverity = severityMap[severity] || "error";
					lintResult[mappedSeverity].push({
						path,
						firstLine: location.start_line,
						lastLine: location.last_line,
						message: `${removeTrailingPeriod(message)} (${rule})`,
					});
				}
			}
		}

		return lintResult;
	}
}

module.exports = RuboCop;


/***/ }),

/***/ 194:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);
const { getNpmBinCommand } = __nccwpck_require__(838);

/**
 * https://stylelint.io
 */
class Stylelint {
	static get name() {
		return "stylelint";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that NPM is installed (required to execute stylelint)
		if (!(await commandExists("npm"))) {
			throw new Error("NPM is not installed");
		}

		// Verify that stylelint is installed
		const commandPrefix = prefix || getNpmBinCommand(dir);
		try {
			run(`${commandPrefix} stylelint -v`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		const files =
			extensions.length === 1 ? `**/*.${extensions[0]}` : `**/*.{${extensions.join(",")}}`;
		const fixArg = fix ? "--fix" : "";
		const commandPrefix = prefix || getNpmBinCommand(dir);
		return run(
			`${commandPrefix} stylelint --no-color --formatter json ${fixArg} ${args} "${files}"`,
			{
				dir,
				ignoreErrors: true,
			},
		);
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		let outputJson;
		try {
			outputJson = JSON.parse(output.stdout);
		} catch (err) {
			throw Error(
				`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
			);
		}

		for (const violation of outputJson) {
			const { source, warnings } = violation;
			const path = source.substring(dir.length + 1);
			for (const warning of warnings) {
				const { line, severity, text } = warning;
				if (severity in lintResult) {
					lintResult[severity].push({
						path,
						firstLine: line,
						lastLine: line,
						message: text,
					});
				}
			}
		}

		return lintResult;
	}
}

module.exports = Stylelint;


/***/ }),

/***/ 983:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);

const PARSE_REGEX = /^(.*):([0-9]+):[0-9]+: \w+: \((\w+)\) (.*)\.$/gm;

/**
 * https://github.com/nicklockwood/SwiftFormat
 */
class SwiftFormatLockwood {
	static get name() {
		return "SwiftFormat";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that SwiftFormat is installed
		if (!(await commandExists("swiftformat"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "swift") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const fixArg = fix ? "" : "--lint";
		return run(`${prefix} swiftformat ${fixArg} ${args} "."`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		const matches = output.stderr.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, pathFull, line, rule, message] = match;
			const path = pathFull.substring(dir.length + 1);
			const lineNr = parseInt(line, 10);
			// SwiftFormat only seems to use the "warning" level, which this action will therefore
			// categorize as errors
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: `${message} (${rule})`,
			});
		}

		return lintResult;
	}
}

module.exports = SwiftFormatLockwood;


/***/ }),

/***/ 828:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);

const PARSE_REGEX = /^(.*):([0-9]+):([0-9]+): (warning|error): (.*)$/gm;

/**
 * https://github.com/apple/swift-format
 */
class SwiftFormatOfficial {
	static get name() {
		return "swift-format";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that swift-format is installed.
		if (!(await commandExists("swift-format"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "swift") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const mode = fix ? "format -i" : "lint";
		return run(`${prefix} swift-format ${mode} ${args} --recursive "."`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();

		const matches = output.stderr.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_line, pathFull, line, _column, _level, message] = match;
			const path = pathFull.substring(dir.length + 1);
			const lineNr = parseInt(line, 10);
			// swift-format only seems to use the "warning" level, which this action will therefore
			// categorize as errors
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: `${message}`,
			});
		}

		// Since 0.50300.0 swift-format exits with 0 even if there are formatting issues. Therefore,
		// this function determines the success of the linting process based on the number of parsed
		// errors.
		lintResult.isSuccess = lintResult.error.length === 0;

		return lintResult;
	}
}

module.exports = SwiftFormatOfficial;


/***/ }),

/***/ 439:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { initLintResult } = __nccwpck_require__(149);

const PARSE_REGEX = /^(.*):([0-9]+):[0-9]+: (warning|error): (.*)$/gm;

/**
 * https://github.com/realm/SwiftLint
 */
class SwiftLint {
	static get name() {
		return "SwiftLint";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that SwiftLint is installed
		if (!(await commandExists("swiftlint"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "swift") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const fixArg = fix ? "autocorrect" : "lint";
		return run(`${prefix} swiftlint ${fixArg} ${args}`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		const matches = output.stdout.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, pathFull, line, level, message] = match;
			const path = pathFull.substring(dir.length + 1);
			const lineNr = parseInt(line, 10);
			lintResult[level].push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message,
			});
		}

		return lintResult;
	}
}

module.exports = SwiftLint;


/***/ }),

/***/ 728:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { run } = __nccwpck_require__(575);
const commandExists = __nccwpck_require__(265);
const { getNpmBinCommand } = __nccwpck_require__(838);
const ESLint = __nccwpck_require__(169);

/**
 * https://github.com/xojs/xo
 * XO is a wrapper for ESLint, so it can use the same logic for parsing lint results
 */
class XO extends ESLint {
	static get name() {
		return "XO";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that NPM is installed (required to execute XO)
		if (!(await commandExists("npm"))) {
			throw new Error("NPM is not installed");
		}

		// Verify that XO is installed
		const commandPrefix = prefix || getNpmBinCommand(dir);
		try {
			run(`${commandPrefix} xo --version`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		const extensionArgs = extensions.map((ext) => `--extension ${ext}`).join(" ");
		const fixArg = fix ? "--fix" : "";
		const commandPrefix = prefix || getNpmBinCommand(dir);
		return run(`${commandPrefix} xo ${extensionArgs} ${fixArg} --reporter json ${args} "."`, {
			dir,
			ignoreErrors: true,
		});
	}
}

module.exports = XO;


/***/ }),

/***/ 575:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { execSync } = __nccwpck_require__(129);

const core = __nccwpck_require__(186);

const RUN_OPTIONS_DEFAULTS = { dir: null, ignoreErrors: false, prefix: "" };

/**
 * Returns the value for an environment variable. If the variable is required but doesn't have a
 * value, an error is thrown
 * @param {string} name - Name of the environment variable
 * @param {boolean} required - Whether an error should be thrown if the variable doesn't have a
 * value
 * @returns {string | null} - Value of the environment variable
 */
function getEnv(name, required = false) {
	const nameUppercase = name.toUpperCase();
	const value = process.env[nameUppercase];
	if (value == null) {
		// Value is either not set (`undefined`) or set to `null`
		if (required) {
			throw new Error(`Environment variable "${nameUppercase}" is not defined`);
		}
		return null;
	}
	return value;
}

/**
 * Executes the provided shell command
 * @param {string} cmd - Shell command to execute
 * @param {{dir: string, ignoreErrors: boolean}} [options] - {@see RUN_OPTIONS_DEFAULTS}
 * @returns {{status: number, stdout: string, stderr: string}} - Output of the shell command
 */
function run(cmd, options) {
	const optionsWithDefaults = {
		...RUN_OPTIONS_DEFAULTS,
		...options,
	};

	core.debug(cmd);

	try {
		const stdout = execSync(cmd, {
			encoding: "utf8",
			cwd: optionsWithDefaults.dir,
			maxBuffer: 20 * 1024 * 1024,
		});
		const output = {
			status: 0,
			stdout: stdout.trim(),
			stderr: "",
		};

		core.debug(`Stdout: ${output.stdout}`);

		return output;
	} catch (err) {
		if (optionsWithDefaults.ignoreErrors) {
			const output = {
				status: err.status,
				stdout: err.stdout.trim(),
				stderr: err.stderr.trim(),
			};

			core.debug(`Exit code: ${output.status}`);
			core.debug(`Stdout: ${output.stdout}`);
			core.debug(`Stderr: ${output.stderr}`);

			return output;
		}
		throw err;
	}
}

module.exports = {
	getEnv,
	run,
};


/***/ }),

/***/ 265:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const checkForCommand = __nccwpck_require__(569);

/**
 * Returns whether the provided shell command is available
 * @param {string} command - Shell command to check for
 * @returns {Promise<boolean>} - Whether the command is available
 */
async function commandExists(command) {
	// The `command-exists` library throws an error if the command is not available. This function
	// catches these errors and returns a boolean value instead
	try {
		await checkForCommand(command);
		return true;
	} catch (error) {
		return false;
	}
}

module.exports = commandExists;


/***/ }),

/***/ 388:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const parseDiff = __nccwpck_require__(833);

/**
 * Parses linting errors from a unified diff
 * @param {string} diff - Unified diff
 * @returns {{path: string, firstLine: number, lastLine: number, message: string}[]} - Array of
 * parsed errors
 */
function parseErrorsFromDiff(diff) {
	const errors = [];
	const files = parseDiff(diff);
	for (const file of files) {
		const { chunks, to: path } = file;
		for (const chunk of chunks) {
			const { oldStart, oldLines, changes } = chunk;
			const chunkDiff = changes.map((change) => change.content).join("\n");
			errors.push({
				path,
				firstLine: oldStart,
				lastLine: oldStart + oldLines,
				message: chunkDiff,
			});
		}
	}
	return errors;
}

module.exports = {
	parseErrorsFromDiff,
};


/***/ }),

/***/ 149:
/***/ ((module) => {

/**
 * GitHub Actions workflow's environment variables
 * @typedef {{isSuccess: boolean, warning: object[], error: object[]}} LintResult
 */

/**
 * Returns an object for storing linting results
 * @returns {LintResult} - Default object
 */
function initLintResult() {
	return {
		isSuccess: true, // Usually determined by the exit code of the linting command
		warning: [],
		error: [],
	};
}

/**
 * Returns a text summary of the number of issues found when linting
 * @param {LintResult} lintResult - Parsed linter
 * output
 * @returns {string} - Text summary
 */
function getSummary(lintResult) {
	const nrErrors = lintResult.error.length;
	const nrWarnings = lintResult.warning.length;
	// Build and log a summary of linting errors/warnings
	if (nrWarnings > 0 && nrErrors > 0) {
		return `${nrErrors} error${nrErrors > 1 ? "s" : ""} and ${nrWarnings} warning${
			nrWarnings > 1 ? "s" : ""
		}`;
	}
	if (nrErrors > 0) {
		return `${nrErrors} error${nrErrors > 1 ? "s" : ""}`;
	}
	if (nrWarnings > 0) {
		return `${nrWarnings} warning${nrWarnings > 1 ? "s" : ""}`;
	}
	return `no issues`;
}

module.exports = {
	getSummary,
	initLintResult,
};


/***/ }),

/***/ 838:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { useYarn } = __nccwpck_require__(753);

/**
 * Returns the NPM or Yarn command ({@see useYarn()}) for executing an NPM binary
 * @param {string} [pkgRoot] - Package directory (directory where Yarn lockfile would exist)
 * @returns {string} - NPM/Yarn command for executing the NPM binary. The binary name should be
 * appended to this command
 */
function getNpmBinCommand(pkgRoot) {
	return useYarn(pkgRoot) ? "yarn run --silent" : "npx --no-install";
}

module.exports = { getNpmBinCommand };


/***/ }),

/***/ 753:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { existsSync } = __nccwpck_require__(747);
const { join } = __nccwpck_require__(622);

const YARN_LOCK_NAME = "yarn.lock";

/**
 * Determines whether Yarn should be used to execute commands or binaries. This decision is based on
 * the existence of a Yarn lockfile in the package directory. The distinction between NPM and Yarn
 * is necessary e.g. for Yarn Plug'n'Play to work
 * @param {string} [pkgRoot] - Package directory (directory where Yarn lockfile would exist)
 * @returns {boolean} - Whether Yarn should be used
 */
function useYarn(pkgRoot) {
	// Use an absolute path if `pkgRoot` is specified and a relative one (current directory) otherwise
	const lockfilePath = pkgRoot ? join(pkgRoot, YARN_LOCK_NAME) : YARN_LOCK_NAME;
	return existsSync(lockfilePath);
}

module.exports = { useYarn };


/***/ }),

/***/ 408:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const https = __nccwpck_require__(211);

/**
 * Helper function for making HTTP requests
 * @param {string | URL} url - Request URL
 * @param {object} options - Request options
 * @returns {Promise<object>} - JSON response
 */
function request(url, options) {
	return new Promise((resolve, reject) => {
		const req = https
			.request(url, options, (res) => {
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => {
					if (res.statusCode >= 400) {
						const err = new Error(`Received status code ${res.statusCode}`);
						err.response = res;
						err.data = data;
						reject(err);
					} else {
						resolve({ res, data: JSON.parse(data) });
					}
				});
			})
			.on("error", reject);
		if (options.body) {
			req.end(JSON.stringify(options.body));
		} else {
			req.end();
		}
	});
}

module.exports = request;


/***/ }),

/***/ 321:
/***/ ((module) => {

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to process
 * @returns {string} - Input string with first letter capitalized
 */
function capitalizeFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Removes the trailing period from the provided string (if it has one)
 * @param {string} str - String to process
 * @returns {string} - String without trailing period
 */
function removeTrailingPeriod(str) {
	return str[str.length - 1] === "." ? str.substring(0, str.length - 1) : str;
}

module.exports = {
	capitalizeFirstLetter,
	removeTrailingPeriod,
};


/***/ }),

/***/ 306:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"lint-action","version":"1.9.0","description":"GitHub Action for detecting and fixing linting errors","author":{"name":"Samuel Meuli","email":"me@samuelmeuli.com","url":"https://samuelmeuli.com"},"repository":"github:wearerequired/lint-action","license":"MIT","private":true,"main":"./dist/index.js","scripts":{"test":"jest","lint":"eslint --max-warnings 0 \\"**/*.js\\"","lint:fix":"yarn lint --fix","format":"prettier --list-different \\"**/*.{css,html,js,json,jsx,less,md,scss,ts,tsx,vue,yaml,yml}\\"","format:fix":"yarn format --write","build":"ncc build ./src/index.js"},"dependencies":{"@actions/core":"^1.2.6","command-exists":"^1.2.9","parse-diff":"^0.8.1"},"peerDependencies":{},"devDependencies":{"@samuelmeuli/eslint-config":"^6.0.0","@samuelmeuli/prettier-config":"^2.0.1","@vercel/ncc":"^0.28.4","eslint":"7.21.0","eslint-config-airbnb-base":"14.2.1","eslint-config-prettier":"^8.1.0","eslint-plugin-import":"^2.22.1","eslint-plugin-jsdoc":"^32.2.0","fs-extra":"^9.1.0","jest":"^26.6.3","prettier":"^2.2.1"},"eslintConfig":{"root":true,"extends":["@samuelmeuli/eslint-config","plugin:jsdoc/recommended"],"env":{"node":true,"jest":true},"settings":{"jsdoc":{"mode":"typescript"}},"rules":{"no-await-in-loop":"off","no-unused-vars":["error",{"args":"none","varsIgnorePattern":"^_"}],"jsdoc/check-indentation":"error","jsdoc/check-syntax":"error","jsdoc/newline-after-description":["error","never"],"jsdoc/require-description":"error","jsdoc/require-hyphen-before-param-description":"error","jsdoc/require-jsdoc":"off"}},"eslintIgnore":["node_modules/","test/linters/projects/","test/tmp/","dist/"],"jest":{"globalSetup":"./test/setup.js","globalTeardown":"./test/teardown.js"},"prettier":"@samuelmeuli/prettier-config"}');

/***/ }),

/***/ 129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");;

/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 211:
/***/ ((module) => {

"use strict";
module.exports = require("https");;

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const { join } = __nccwpck_require__(622);

const core = __nccwpck_require__(186);

const git = __nccwpck_require__(109);
const { createCheck } = __nccwpck_require__(872);
const { getContext } = __nccwpck_require__(476);
const linters = __nccwpck_require__(565);
const { getSummary } = __nccwpck_require__(149);

/**
 * Parses the action configuration and runs all enabled linters on matching files
 */
async function runAction() {
	const context = getContext();
	const autoFix = core.getInput("auto_fix") === "true";
	const continueOnError = core.getInput("continue_on_error") === "true";
	const gitName = core.getInput("git_name", { required: true });
	const gitEmail = core.getInput("git_email", { required: true });
	const commitMessage = core.getInput("commit_message", { required: true });
	const checkName = core.getInput("check_name", { required: true });
	const isPullRequest =
		context.eventName === "pull_request" || context.eventName === "pull_request_target";

	// If on a PR from fork: Display messages regarding action limitations
	if (isPullRequest && context.repository.hasFork) {
		core.error(
			"This action does not have permission to create annotations on forks. You may want to run it only on `push` events. See https://github.com/wearerequired/lint-action/issues/13 for details",
		);
		if (autoFix) {
			core.error(
				"This action does not have permission to push to forks. You may want to run it only on `push` events. See https://github.com/wearerequired/lint-action/issues/13 for details",
			);
		}
	}

	if (autoFix) {
		// Set Git committer username and password
		git.setUserInfo(gitName, gitEmail);
	}
	if (isPullRequest) {
		// Fetch and check out PR branch:
		// - "push" event: Already on correct branch
		// - "pull_request" event on origin, for code on origin: The Checkout Action
		//   (https://github.com/actions/checkout) checks out the PR's test merge commit instead of the
		//   PR branch. Git is therefore in detached head state. To be able to push changes, the branch
		//   needs to be fetched and checked out first
		// - "pull_request" event on origin, for code on fork: Same as above, but the repo/branch where
		//   changes need to be pushed is not yet available. The fork needs to be added as a Git remote
		//   first
		git.checkOutRemoteBranch(context);
	}

	let headSha = git.getHeadSha();

	let hasFailures = false;
	const checks = [];

	// Loop over all available linters
	for (const [linterId, linter] of Object.entries(linters)) {
		// Determine whether the linter should be executed on the commit
		if (core.getInput(linterId) === "true") {
			core.startGroup(`Run ${linter.name}`);

			const fileExtensions = core.getInput(`${linterId}_extensions`, { required: true });
			const args = core.getInput(`${linterId}_args`);
			const lintDirRel = core.getInput(`${linterId}_dir`) || ".";
			const prefix = core.getInput(`${linterId}_command_prefix`);
			const lintDirAbs = join(context.workspace, lintDirRel);

			// Check that the linter and its dependencies are installed
			core.info(`Verifying setup for ${linter.name}…`);
			await linter.verifySetup(lintDirAbs, prefix);
			core.info(`Verified ${linter.name} setup`);

			// Determine which files should be linted
			const fileExtList = fileExtensions.split(",");
			core.info(`Will use ${linter.name} to check the files with extensions ${fileExtList}`);

			// Lint and optionally auto-fix the matching files, parse code style violations
			core.info(
				`Linting ${autoFix ? "and auto-fixing " : ""}files in ${lintDirAbs} with ${linter.name}…`,
			);
			const lintOutput = linter.lint(lintDirAbs, fileExtList, args, autoFix, prefix);

			// Parse output of linting command
			const lintResult = linter.parseOutput(context.workspace, lintOutput);
			const summary = getSummary(lintResult);
			core.info(
				`${linter.name} found ${summary} (${lintResult.isSuccess ? "success" : "failure"})`,
			);

			if (!lintResult.isSuccess) {
				hasFailures = true;
			}

			if (autoFix) {
				// Commit and push auto-fix changes
				if (git.hasChanges()) {
					git.commitChanges(commitMessage.replace(/\${linter}/g, linter.name));
					git.pushChanges();
				}
			}

			const lintCheckName = checkName
				.replace(/\${linter}/g, linter.name)
				.replace(/\${dir}/g, lintDirRel !== "." ? `${lintDirRel}` : "")
				.trim();

			checks.push({ lintCheckName, lintResult, summary });

			core.endGroup();
		}
	}

	// Add commit annotations after running all linters. To be displayed on pull requests, the
	// annotations must be added to the last commit on the branch. This can either be a user commit or
	// one of the auto-fix commits
	if (isPullRequest && autoFix) {
		headSha = git.getHeadSha();
	}

	core.startGroup("Create check runs with commit annotations");
	await Promise.all(
		checks.map(({ lintCheckName, lintResult, summary }) =>
			createCheck(lintCheckName, headSha, context, lintResult, summary),
		),
	);
	core.endGroup();

	if (hasFailures && !continueOnError) {
		core.setFailed("Linting failures detected. See check runs with annotations for details.");
	}
}

runAction().catch((error) => {
	core.debug(error.stack || "No error stack trace");
	core.setFailed(error.message);
});

})();

module.exports = __webpack_exports__;
/******/ })()
;