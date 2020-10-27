/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-types */

import nock from 'nock';
// Requiring our app implementation
import myProbotApp from '../src';
import { Probot, ProbotOctokit } from 'probot';
// Requiring our fixtures
import issueOpenPayload from './fixtures/issues.opened.json';
//import prOpenPayload from './fixtures/pull_request.reopened.json';

const fs = require('fs');
const path = require('path');

describe('My Probot app', () => {
    let probot: Probot;
    let mockCert: string;

    beforeAll((done: Function) => {
        fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err: Error, cert: string) => {
            if (err) return done(err);
            mockCert = cert;
            done();
        });
    });

    beforeEach(async () => {
        nock.disableNetConnect();
        probot = new Probot({ privateKey: mockCert, githubToken: 'test', Octokit: ProbotOctokit });
        // Load our app into probot
        const app = probot.load(myProbotApp);
        await app.auth();
    });

    test('creates a comment when an issue is opened', async (done) => {
        // Test that we correctly return a test token
        nock('https://api.github.com').post('/app/installations/78039/access_tokens').reply(200, { token: 'test' });

        // Test that a comment is posted
        nock('https://api.github.com')
            .post('/repos/hoonsubin/TestyMcTest/issues/20/comments', (body: any) => {
                done(expect(body).toMatchObject({ body: 'Hello World!' }));
                return true;
            })
            .reply(200);

        // Receive a mock webhook event
        await probot.receive({
            id: '7245c480-178b-11eb-8809-f58eeee32a9a',
            name: 'issues.opened',
            payload: issueOpenPayload,
        });
    });

    // test('creates a comment when an pull request is opened', async (done) => {
    //     // Test that we correctly return a test token
    //     nock('https://api.github.com').post('/app/installations/2/access_tokens').reply(200, { token: 'test' });

    //     // Test that a comment is posted
    //     nock('https://api.github.com')
    //         .post('/repos/hoonsubin/TestyMcTest/pulls/18', (body: any) => {
    //             done(expect(body).toMatchObject(issueCreatedBody));
    //             return true;
    //         })
    //         .reply(200);

    //     // Receive a webhook event
    //     await probot.receive({ id: '5325', name: 'pull_request.opened', payload: prOpenPayload });
    // });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about using TypeScript in your tests, Jest recommends:
// https://github.com/kulshekhar/ts-jest

// For more information about testing with Nock see:
// https://github.com/nock/nock
