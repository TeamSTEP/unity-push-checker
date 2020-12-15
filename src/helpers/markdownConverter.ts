import { PullRequestCode } from '../types';

/**
 * Converts the given Github code changes into a markdown bullet point
 * @param changes changed code and the raw URL
 */
export const prChangesToBullet = (changes: PullRequestCode[]): string => {
    if (changes.length < 1) return '';
    return changes
        .map((a) => {
            return `- [${a.fileName}](${a.diffViewUrl})`;
        })
        .join('\n');
};
