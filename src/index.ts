import { Application } from 'probot'; // eslint-disable-line no-unused-vars
//import * as Controllers from './controllers';

export = (app: Application): void => {
    //const a = new Application({});

    app.log.debug('Github bot is running');

    // app.on(
    //     ['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'],
    //     Controllers.PullRequestHandlers.handlePullRequest,
    // );

    app.on('issues.opened', async (context) => {
        app.log.debug(context.payload);

        const pull = context.issue({ body: 'Hello World!' });

        await context.github.issues.createComment({ ...pull });
    });

    app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], async (context) => {
        app.log.debug(context.payload);
    });

    app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], async (context) => {
        app.log.debug(JSON.stringify(context));
        const pr = context.payload.pull_request;
        const org = pr.base.repo.owner.login as string; // name (id) of the owner
        const repo = pr.base.repo.name as string; // name of the repository
        const issueNo = pr.number as number;

        const allFiles = await context.github.paginate(
            context.github.pulls.listFiles,
            context.pullRequest({ owner: org, repo: repo, pull_number: issueNo }),
            (res) => res.data,
        );
        const list = await context.github.pulls.listFiles();
        app.log.debug(list);

        app.log.debug(allFiles);
    });
};
