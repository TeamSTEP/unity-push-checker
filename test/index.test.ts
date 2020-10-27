/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-types */

import nock from 'nock';
// Requiring our app implementation
import myProbotApp from '../src';
import { Probot, ProbotOctokit } from 'probot';
// Requiring our fixtures
import issueOpenPayload from './fixtures/issues.opened.json';
import prReopenPayload from './fixtures/pull_request.reopened.json';
import prFilesRes from './fixtures/pull_request.files.json';
import prCheckExpectedRes from './fixtures/pr_check_msg.json';
import prCommentRes from './fixtures/pull_request.comment.json';

const fs = require('fs');
const path = require('path');

describe('Github bot tests', () => {
    let probot: Probot;
    let mockCert: string;

    beforeAll((done: Function) => {
        fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err: Error, cert: string) => {
            if (err) return done(err);
            mockCert = cert;
            done();
        });
        nock.disableNetConnect();
    });

    beforeEach(async () => {
        probot = new Probot({ privateKey: mockCert, githubToken: 'test', Octokit: ProbotOctokit });
        // Load our app into probot
        probot.load(myProbotApp);
        // Test that we correctly return a test token
        nock('https://api.github.com').post('/app/installations/78039/access_tokens').reply(200, { token: 'test' });
    });

    it('creates a comment when an issue is opened', async (done) => {
        nock('https://api.github.com')
            .post('/repos/hoonsubin/TestyMcTest/issues/20/comments', (body: any) => {
                // Test that a comment is posted
                done(expect(body).toMatchObject({ body: 'Hello World!' }));
                return true;
            })
            .reply(200);

        // Receive a mock webhook event
        await probot.receive({
            id: '1',
            name: 'issues.opened',
            payload: issueOpenPayload,
        });
    });

    it('creates a new scan report comment', async (done) => {
        nock('https://api.github.com')
            .get('/repos/hoonsubin/TestyMcTest/pulls/18/files')
            .reply(200, prFilesRes) // send a list of files upon request
            .get('/repos/hoonsubin/TestyMcTest/issues/18/comments')
            .reply(200, []); // send no comments

        nock('https://api.github.com')
            .post('/repos/hoonsubin/TestyMcTest/issues/18/comments', (body: any) => {
                done(expect(body).toMatchObject(prCheckExpectedRes));
                return true;
            })
            .reply(200);

        // Receive a mock webhook event
        await probot.receive({
            id: '2',
            name: 'pull_request.reopened',
            payload: prReopenPayload,
        });
    });

    it('updates an existing scan report comment', async (done) => {
        nock('https://api.github.com')
            .get('/repos/hoonsubin/TestyMcTest/pulls/18/files')
            .reply(200, prFilesRes) // send a list of files upon request
            .get('/repos/hoonsubin/TestyMcTest/issues/18/comments')
            .reply(200, prCommentRes); // send a list of comment

        nock('https://api.github.com')
            .patch(
                (uri) => {
                    return uri.startsWith('/repos/hoonsubin/TestyMcTest/issues/comments');
                },
                (body: any) => {
                    done(expect(body).toMatchObject(prCheckExpectedRes));
                    return true;
                },
            )
            .reply(200);

        // Receive a mock webhook event
        await probot.receive({
            id: '3',
            name: 'pull_request.reopened',
            payload: prReopenPayload,
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    afterAll(() => {
        nock.enableNetConnect();
    });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about using TypeScript in your tests, Jest recommends:
// https://github.com/kulshekhar/ts-jest

// For more information about testing with Nock see:
// https://github.com/nock/nock
