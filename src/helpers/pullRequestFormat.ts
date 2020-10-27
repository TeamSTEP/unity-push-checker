import { PullRequestCode } from '../types';
import { PullsListFilesResponseData } from '@octokit/types';
import fileExts from '../data/filesToCheck.json';

export const prFilesToFormat = (files: PullsListFilesResponseData) => {
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
        addedFiles,
        moddedFiles,
        removedFiles,
    };
};
