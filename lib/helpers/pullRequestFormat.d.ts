import { PullRequestCode } from '../types';
import { PullsListFilesResponseData } from '@octokit/types';
export declare const prFilesToFormat: (files: PullsListFilesResponseData) => {
    addedFiles: PullRequestCode[];
    moddedFiles: PullRequestCode[];
    removedFiles: PullRequestCode[];
};
