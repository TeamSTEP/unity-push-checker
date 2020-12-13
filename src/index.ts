import { ApplicationFunctionOptions } from 'probot/lib/types';
import * as Controllers from './controllers';

export default async ({ app }: ApplicationFunctionOptions) => {
    app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], async (context) => {
        try {
            const pr = context.payload.pull_request;

            app.log(
                `Pull request number ${pr.number} from ${pr.base.repo.owner.login}/${pr.base.repo.name} emitted a new event`,
            );

            await Controllers.PullRequestHandlers.handlePullRequest(context);
        } catch (e) {
            app.log.error(e);
        }
    });
};
