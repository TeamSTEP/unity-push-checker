const emptyEntry = 'None';

const commentTemplate = (added: string, mod: string, rem: string): string =>
    `# Unity Project Report

These are the files that were changed from the main branch.

## Newly Added Files

${added ? added : emptyEntry}

## Modified Files

${mod ? mod : emptyEntry}

## Removed Files

${rem ? rem : emptyEntry}

----
End of report

This bot was made by [Hoon Kim](https://github.com/hoonsubin) with love :)
`;

export default commentTemplate;
