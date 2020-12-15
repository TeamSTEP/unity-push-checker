import { PullRequestCode } from '../types';
import { Endpoints } from '@octokit/types';
import fileExts from '../data/filesToCheck.json';
import crypto from 'crypto';

// decare rest api request type
type PullsListFilesResponseData = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/files']['response']['data'];
interface PullContext {
    issue_number: number;
    owner: string;
    repo: string;
}

const getFileDiffAnchor = (fileName: string) => {
    const diffHash = crypto.createHash('sha256').update(fileName).digest('hex');

    return `diff-${diffHash}`;
};

const getFileDiffLink = (fileName: string, prInfo: PullContext) => {
    const baseUrl = 'https://github.com';
    // file diff view is https://github.com/{org}/{repo}/pull/{pr_number}/files#{diff_anchor}
    const diffAnchor = getFileDiffAnchor(fileName);
    return `${baseUrl}/${prInfo.owner}/${prInfo.repo}/pull/${prInfo.issue_number}/files#${diffAnchor}`;
};

export const prFilesToFormat = (files: PullsListFilesResponseData, prContext: PullContext) => {
    //todo: use context.config rather than a hard-coded filesToCheck.json to load extensions
    // more info from here: <https://probot.github.io/api/latest/classes/context.html#config>

    // regex for the file extension that should be checked (source is inside the data folder)
    const searchRegex = new RegExp(`^.*\.(${fileExts.join('|')})$`);
    const changedFiles = files.filter((i) => {
        return searchRegex.test(i.filename);
    });

    // initialize item list
    const addedFiles: PullRequestCode[] = [];
    const moddedFiles: PullRequestCode[] = [];
    const removedFiles: PullRequestCode[] = [];

    changedFiles.forEach((e) => {
        switch (e.status) {
            case 'modified':
                moddedFiles.push({
                    fileName: e.filename,
                    diffViewUrl: getFileDiffLink(e.filename, prContext),
                });
                break;
            case 'added':
                addedFiles.push({
                    fileName: e.filename,
                    diffViewUrl: getFileDiffLink(e.filename, prContext),
                });
                break;
            case 'removed':
                removedFiles.push({
                    fileName: e.filename,
                    diffViewUrl: getFileDiffLink(e.filename, prContext),
                });
                break;
        }
    });

    return {
        addedFiles,
        moddedFiles,
        removedFiles,
    };
};
