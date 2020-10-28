const emptyEntry = 'None';

const commentTemplate = (added: string, mod: string, rem: string): string =>
    `
## Unity Project Report

These are the files that were changed from the merging branch.
Please don't edit this part.

### Newly Added Files

${added ? added : emptyEntry}

### Modified Files

${mod ? mod : emptyEntry}

### Removed Files

${rem ? rem : emptyEntry}

----
End of report
`;

export default commentTemplate;
