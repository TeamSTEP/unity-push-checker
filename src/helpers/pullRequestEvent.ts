import { Context } from 'probot';
import { PullRequestCode } from 'src/types';
import fileExts from '../data/filesToCheck.json';
import commentTemplate from 'src/data/commentTemplate';
import { prChangesToBullet } from './markdownConverter';

export const handlePullRequest = async (context: Context) => {
    const pr = context.payload.pull_request;
    if (!pr || pr.state !== 'open') return;

    const org = pr.base.repo.owner.login;
    const repo = pr.base.repo.name;

    const files = await context.github.pulls.listFiles({
        number: pr.number,
        owner: org,
        repo: repo,
    });

    const searchRegex = `^.*\.(${fileExts.join('|')})$`;

    const changedFiles = files.data.filter((i) => {
        !!i.filename.match(searchRegex) === true;
    });

    let addedFiles: PullRequestCode[] = [];
    let moddedFiles: PullRequestCode[] = [];
    let removedFiles: PullRequestCode[] = [];

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

    const commentBody = commentTemplate(
        prChangesToBullet(addedFiles),
        prChangesToBullet(moddedFiles),
        prChangesToBullet(removedFiles),
    );

    const pull = context.issue();
    // Post a comment on the issue
    await context.github.issues.createComment({ ...pull, body: commentBody });
};
