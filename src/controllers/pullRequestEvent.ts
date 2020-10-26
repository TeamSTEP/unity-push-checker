import { Context } from 'probot';
import { PullRequestCode } from '../types';
import fileExts from '../data/filesToCheck.json';
import commentTemplate from '../data/commentTemplate';
import { prChangesToBullet } from '../helpers/markdownConverter';
import { PullsListFilesResponseData } from '@octokit/types';

const prFilesToFormat = (files: PullsListFilesResponseData) => {
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
    // ensure that this handler is running for a pull request
    if (!pr || pr.state !== 'open' || context.isBot) return;

    const org = pr.base.repo.owner.login as string; // name (id) of the owner
    const repo = pr.base.repo.name as string; // name of the repository
    const issueNo = pr.number as number;

    const filesChanged = Number.parseInt(pr.changed_files);

    if (filesChanged < 3000) {
    }

    const allFiles = await context.github.paginate(
        context.github.pulls.listFiles,
        context.pullRequest({ owner: org, repo: repo, pull_number: issueNo }),
        (res) => res.data,
    );

    const changes = prFilesToFormat(allFiles);

    // if there are no relevant changes to the push, do not post a message
    if (changes.addedFiles.length === 0 && changes.moddedFiles.length === 0 && changes.removedFiles.length === 0) {
        return;
    }

    const commentBody =
        commentTemplate(
            prChangesToBullet(changes.addedFiles),
            prChangesToBullet(changes.moddedFiles),
            prChangesToBullet(changes.removedFiles),
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
