import { PullRequestCode } from '../types';
/**
 * Converts the given Github code changes into a markdown bullet point
 * @param changes changed code and the raw URL
 */
export declare const prChangesToBullet: (changes: PullRequestCode[]) => string;
