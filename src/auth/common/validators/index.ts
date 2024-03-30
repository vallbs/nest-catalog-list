import { IsEmailUnique } from './is-unique-emails.validator';
import { IsUserNameUnique } from './is-unique-user-name.validator';

export * from './is-unique-emails.validator';
export * from './is-unique-user-name.validator';

export const VALIDATORS = [IsEmailUnique, IsUserNameUnique];
