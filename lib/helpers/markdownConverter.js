"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prChangesToBullet = void 0;
/**
 * Converts the given Github code changes into a markdown bullet point
 * @param changes changed code and the raw URL
 */
exports.prChangesToBullet = function (changes) {
    if (changes.length < 1)
        return '';
    return changes
        .map(function (a) {
        return "- [" + a.fileName + "](" + a.rawUrl + ")";
    })
        .join('\n');
};
//# sourceMappingURL=markdownConverter.js.map