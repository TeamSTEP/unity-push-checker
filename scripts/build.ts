#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import projectPacks from '../package.json';

interface NpmPackage {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

// properties that we want to keep from the original
const packageKeys = ['name', 'version', 'scripts', 'devDependencies', 'dependencies', 'engines'];
// properties we will manually override
const npmScripts = { start: 'probot run ./index.js' };

// the folder that contains the production build
const productionBin = 'lib';

/**
 * Dynamically generate a package.json file for the distribution package
 */
const generatePackConfig = () => {
    const packCfg: NpmPackage = {
        name: 'deploy-build',
    };

    for (const [key, value] of Object.entries(projectPacks)) {
        if (packageKeys.includes(key)) {
            // Object.defineProperty(packCfg, key, {
            //     value: key === 'scripts' ? npmScripts : value,
            //     writable: true,
            // });
            packCfg[key] = key === 'scripts' ? npmScripts : value;
        }
    }
    return packCfg;
};

(async () => {
    const distPath = path.join(process.cwd(), productionBin);

    //if (!process.env.REPO_SOURCE) throw new Error('No deploy repository provided');

    const packageConfig = generatePackConfig();
    console.log('building a custom package file...');
    fs.writeFile(`${distPath}/package.json`, JSON.stringify(packageConfig), function (err) {
        if (err) throw err;
        else console.log('moved custom package to the distribution folder');
    });
})().catch((err) => {
    console.log(err);
    process.exit(1);
});
