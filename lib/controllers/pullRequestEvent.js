"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePullRequest = void 0;
var commentTemplate_1 = __importDefault(require("../data/commentTemplate"));
var markdownConverter_1 = require("../helpers/markdownConverter");
var Helpers = __importStar(require("../helpers"));
var lodash_1 = __importDefault(require("lodash"));
var appSlug_1 = __importDefault(require("../data/appSlug"));
exports.handlePullRequest = function (context) { return __awaiter(void 0, void 0, void 0, function () {
    var pr, allFiles, changes, allComments, botComment, commentBody;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pr = context.payload.pull_request;
                // ensure that this handler is running for a pull request
                if (!pr || pr.state !== 'open')
                    return [2 /*return*/];
                return [4 /*yield*/, context.github.paginate(context.github.pulls.listFiles, context.pullRequest(), function (res) { return res.data; })];
            case 1:
                allFiles = _a.sent();
                changes = Helpers.PullRequestFormatter.prFilesToFormat(allFiles);
                // if there are no relevant changes to the push, do not post a message
                if (changes.addedFiles.length + changes.moddedFiles.length + changes.removedFiles.length < 1) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, context.github.paginate('GET /repos/:owner/:repo/issues/:issue_number/comments', context.issue(), function (res) { return res.data; })];
            case 2:
                allComments = _a.sent();
                botComment = lodash_1.default.find(allComments, function (i) {
                    return i.user.login.includes(appSlug_1.default);
                });
                commentBody = commentTemplate_1.default(markdownConverter_1.prChangesToBullet(changes.addedFiles), markdownConverter_1.prChangesToBullet(changes.moddedFiles), markdownConverter_1.prChangesToBullet(changes.removedFiles));
                if (!(typeof botComment === 'undefined')) return [3 /*break*/, 4];
                // create a new comment if there is no existing one
                return [4 /*yield*/, context.github.issues.createComment(__assign(__assign({}, context.issue()), { body: commentBody }))];
            case 3:
                // create a new comment if there is no existing one
                _a.sent();
                return [3 /*break*/, 6];
            case 4: 
            // update the existing comment
            return [4 /*yield*/, context.github.issues.updateComment(__assign(__assign({}, context.issue()), { body: commentBody, comment_id: botComment.id }))];
            case 5:
                // update the existing comment
                _a.sent();
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=pullRequestEvent.js.map