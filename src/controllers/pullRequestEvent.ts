import { Context } from 'probot';
import commentTemplate from '../data/commentTemplate';
import { prChangesToBullet } from '../helpers/markdownConverter';
import * as Helpers from '../helpers';

export const handlePullRequest = async (context: Context) => {
    //context.github.apps
    const pr = context.payload.pull_request;
    // ensure that this handler is running for a pull request
    if (!pr || pr.state !== 'open' || context.isBot) return;

    // get a list of all the files that were changed in the current PR
    const allFiles = await context.github.paginate(
        context.github.pulls.listFiles,
        context.pullRequest(),
        (res) => res.data,
    );
    // format the changes into different sections
    const changes = Helpers.PullRequestFormatter.prFilesToFormat(allFiles);

    // if there are no relevant changes to the push, do not post a message
    if (changes.addedFiles.length + changes.moddedFiles.length + changes.removedFiles.length < 1) {
        return;
    }

    // the pr description left by the owner
    const prevBody = pr.body;

    // scan report in markdown
    const commentBody = commentTemplate(
        prChangesToBullet(changes.addedFiles),
        prChangesToBullet(changes.moddedFiles),
        prChangesToBullet(changes.removedFiles),
    );

    // update the pr description
    await context.github.pulls.update({ ...pr, body: commentBody });
};
