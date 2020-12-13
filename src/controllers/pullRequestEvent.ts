import { Context } from 'probot';
import commentTemplate from '../data/commentTemplate';
import { prChangesToBullet } from '../helpers/markdownConverter';
import * as Helpers from '../helpers';
import _ from 'lodash';
import APP_SLUG from '../data/appSlug';

export const handlePullRequest = async (context: Context) => {
    const pr = context.payload.pull_request;

    // ensure that this handler is running for a pull request
    if (!pr || pr.state !== 'open') return;

    // get a list of all the files that were changed in the current PR
    const allFiles = await context.octokit.paginate(
        context.octokit.pulls.listFiles,
        context.pullRequest(),
        (res) => res.data,
    );
    // format the changes into different sections
    const changes = Helpers.PullRequestFormatter.prFilesToFormat(allFiles);

    // if there are no relevant changes to the push, do not post a message
    if (changes.addedFiles.length + changes.moddedFiles.length + changes.removedFiles.length < 1) {
        return;
    }

    // scan report in markdown
    const commentBody = commentTemplate(
        prChangesToBullet(changes.addedFiles),
        prChangesToBullet(changes.moddedFiles),
        prChangesToBullet(changes.removedFiles),
    );

    // note: we manually pass the string request due to a bug with context.github.issues.listComments
    const allComments = await context.octokit.paginate(
        'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
        context.issue(),
        (res) => res.data,
    );

    // check if this bot has already left a comment
    const botComment = _.find(allComments, (i) => {
        if (!i.user) return false;
        return i.user.login.includes(APP_SLUG);
    });

    if (typeof botComment === 'undefined') {
        // create a new comment if there is no existing one
        await context.octokit.issues.createComment({ ...context.issue(), body: commentBody });
    } else {
        // update the existing comment
        await context.octokit.issues.updateComment({
            ...context.issue(),
            body: commentBody,
            comment_id: botComment.id,
        });
    }
};
