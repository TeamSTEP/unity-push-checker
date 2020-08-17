import { Application } from 'probot'; // eslint-disable-line no-unused-vars
import { handlePullRequest } from './helpers/pullRequestEvent';

export = (app: Application): void => {
    // Your code here

    app.on(['issues.opened', 'issues.reopened'], async (context) => {
        // `context` extracts information from the event, which can be passed to
        // GitHub API calls. This will return:
        //   { owner: 'yourname', repo: 'yourrepo', number: 123, body: 'Hello World !}
        const params = context.issue({ body: 'Hello World!' });

        // Post a comment on the issue
        await context.github.issues.createComment(params);
    });

    app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], handlePullRequest);

    app.on(['pull_request.opened', 'pull_request.reopened'], async (context) => {
        // `context` extracts information from the event, which can be passed to
        // GitHub API calls. This will return:
        //   { owner: 'yourname', repo: 'yourrepo', number: 123, body: 'Hello World !}
        const params = context.issue({ body: 'Thank you for opening a Pull Request' });

        // Post a comment on the issue
        await context.github.issues.createComment(params);
    });
    // For more information on building apps:
    // https://probot.github.io/docs/

    // To get your app running against GitHub, see:
    // https://probot.github.io/docs/development/
};
