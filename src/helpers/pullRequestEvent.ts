import { Context, Octokit } from 'probot';
import { PullRequestCode } from '../types';
import fileExts from '../data/filesToCheck.json';
import commentTemplate from '../data/commentTemplate';
import { prChangesToBullet } from './markdownConverter';

const prFilesToFormat = (files: Octokit.PullsListFilesResponse) => {
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

export const handlePullRequest = async (context: Context): Promise<void> => {
    const pr = context.payload.pull_request;
    if (!pr || pr.state !== 'open') return;

    const org = pr.base.repo.owner.login;
    const repo = pr.base.repo.name;

    const allFiles: Octokit.PullsListFilesResponse = await context.github.paginate(
        context.github.pulls.listFiles({
            number: pr.number,
            owner: org,
            repo: repo,
        }),
        (res) => res.data,
    );

    const _changes = prFilesToFormat(allFiles);

    // if there are no relevant changes to the push, do not post a message
    if (_changes.addedFiles.length === 0 && _changes.moddedFiles.length === 0 && _changes.removedFiles.length === 0) {
        return;
    }

    const commentBody =
        commentTemplate(
            prChangesToBullet(_changes.addedFiles),
            prChangesToBullet(_changes.moddedFiles),
            prChangesToBullet(_changes.removedFiles),
        ) +
        '\nScanned ' +
        allFiles.length +
        ' files';

    const pull = context.issue();

    //todo: if a comment already exists in the PR, update the comment rather than making a new one
    //await context.github.issues.updateComment({...params});

    // Post a comment on the issue
    await context.github.issues.createComment({ ...pull, body: commentBody });
};
