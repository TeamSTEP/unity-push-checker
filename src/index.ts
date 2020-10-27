import { Application } from 'probot';
import * as Controllers from './controllers';

export = async (app: Application) => {
    app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], (context) => {
        try {
            const pr = context.payload.pull_request;

            app.log(
                `Pull request number ${pr.number} from ${pr.base.repo.owner.login}/${pr.base.repo.name} emitted a new event`,
            );

            Controllers.PullRequestHandlers.handlePullRequest(context);
            app.log('Report created');
        } catch (e) {
            app.log.error(e);
        }
    });

    // this is for debugging only
    app.on('issues.opened', async (context) => {
        try {
            const newIssue = context.payload.issue;
            app.log(`User ${newIssue.user.login} opened a new issue with the name ${newIssue.title}`);

            const pull = context.issue();

            await context.github.issues.createComment({ ...pull, body: 'Hello World!' });
        } catch (e) {
            app.log(e);
        }
    });
};
