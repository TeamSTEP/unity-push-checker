"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var emptyEntry = 'None';
var commentTemplate = function (added, mod, rem) {
    return "\n----\n## Unity Project Report\n\nThese are the files that were changed from the merging branch.\nPlease don't edit this part.\n\n### Newly Added Files\n\n" + (added ? added : emptyEntry) + "\n\n### Modified Files\n\n" + (mod ? mod : emptyEntry) + "\n\n### Removed Files\n\n" + (rem ? rem : emptyEntry) + "\n\nEnd of report\n----\n";
};
exports.default = commentTemplate;
//# sourceMappingURL=commentTemplate.js.map