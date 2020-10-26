import { Application } from 'probot'; // eslint-disable-line no-unused-vars
import * as Controllers from './controllers';

export = async (app: Application): Promise<void> => {
    await app.auth(process.env.APP_ID ? Number.parseInt(process.env.APP_ID) : undefined);
    //const a = new Application({});

    app.log('Github bot is running');

    app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], (context) => {
        const pr = context.payload.pull_request;

        app.log(
            `Pull request number ${pr.number} from ${pr.base.repo.owner.login}/${pr.base.repo.name}emitted a new event`,
        );

        Controllers.PullRequestHandlers.handlePullRequest(context);
    });

    app.on('issues.opened', async (context) => {
        try {
            app.log(context.payload);

            const pull = context.issue({ body: 'Hello World!' });

            await context.github.issues.createComment({ ...pull });
        } catch (e) {
            app.log(e);
        }
    });
};
