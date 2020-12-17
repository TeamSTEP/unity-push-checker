import { Probot } from 'probot';
import * as controller from './controller';

const pullRequestChangeCheckApp = async (app: Probot) => {
    app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], async (context) => {
        try {
            const pr = context.payload.pull_request;

            app.log(
                `Pull request number ${pr.number} from ${pr.base.repo.owner.login}/${pr.base.repo.name} emitted a new event`,
            );

            await controller.PullRequestHandlers.handlePullRequest(context);
        } catch (e) {
            app.log.error(e);
        }
    });
};

export default pullRequestChangeCheckApp;
