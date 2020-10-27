import { Context } from 'probot';
import commentTemplate from '../data/commentTemplate';
import { prChangesToBullet } from '../helpers/markdownConverter';
import * as Helpers from '../helpers';
import _ from 'lodash';

export const handlePullRequest = async (context: Context) => {
    const pr = context.payload.pull_request;

    // ensure that this handler is running for a pull request
    if (!pr || pr.state !== 'open') return;

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

    let originalDescription = pr.body as string;
    // the pr description left by the owner
    // we tokenize everything which may include the scan report from the bot
    const prFullBodyToken = originalDescription.split('\n');

    // we subtract 1 here because we have the string \n----\n in the start of the report. Everything above that will be kept
    const breakFromIndex = _.findIndex(prFullBodyToken, '# Unity Project Report') - 1;

    if (breakFromIndex > 0 && prFullBodyToken.length > 0) {
        const upperContent = prFullBodyToken.slice(0, breakFromIndex);

        // we add 1 here because we have the string \n----\n at the end of the report. Everything below should be kept
        const breakToIndex = _.findLastIndex(prFullBodyToken, 'End of report') + 1;
        const lowerContent = prFullBodyToken.slice(breakToIndex, prFullBodyToken.length);

        // stack the upper and lower descriptions together
        originalDescription = upperContent.join('\n').concat(lowerContent.join('\n'));
    }

    // scan report in markdown
    const commentBody = commentTemplate(
        prChangesToBullet(changes.addedFiles),
        prChangesToBullet(changes.moddedFiles),
        prChangesToBullet(changes.removedFiles),
    );

    // update the pr description
    await context.github.pulls.update({ ...pr, body: originalDescription.concat(commentBody) });
};
