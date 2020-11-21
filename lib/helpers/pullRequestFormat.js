"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prFilesToFormat = void 0;
var filesToCheck_json_1 = __importDefault(require("../data/filesToCheck.json"));
exports.prFilesToFormat = function (files) {
    //todo: use context.config rather than a hard-coded filesToCheck.json to load extensions
    // more info from here: <https://probot.github.io/api/latest/classes/context.html#config>
    // regex for the file extension that should be checked (source is inside the data folder)
    var searchRegex = new RegExp("^.*.(" + filesToCheck_json_1.default.join('|') + ")$");
    var changedFiles = files.filter(function (i) {
        return searchRegex.test(i.filename);
    });
    // initialize item list
    var addedFiles = [];
    var moddedFiles = [];
    var removedFiles = [];
    changedFiles.forEach(function (e) {
        switch (e.status) {
            case 'modified':
                moddedFiles.push({
                    fileName: e.filename,
                    rawUrl: e.raw_url,
                });
                break;
            case 'added':
                addedFiles.push({
                    fileName: e.filename,
                    rawUrl: e.raw_url,
                });
                break;
            case 'removed':
                removedFiles.push({
                    fileName: e.filename,
                    rawUrl: e.raw_url,
                });
                break;
        }
    });
    return {
        addedFiles: addedFiles,
        moddedFiles: moddedFiles,
        removedFiles: removedFiles,
    };
};
//# sourceMappingURL=pullRequestFormat.js.map