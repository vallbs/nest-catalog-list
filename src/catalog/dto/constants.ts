import { Vertical } from '../interfaces';

export const VALIDATION = Object.freeze({
  NAME: {
    ONLY_LETTERS: 'name can contain only letters',
    STRING: 'name must be a string',
    NOT_EMPTY: 'name should not be empty',
    ALREADY_EXISTS: `A catalog with the name '{name}' already exists.`,
  },
  VERTICAL: {
    FROM_ENUM: `vertical must be one of the following values: ${Object.values(Vertical).join(', ')}`,
    SECOND_PRIMARY: `A primary catalog already exists in the '{vertical}' vertical for this user.`,
  },
  CATALOG: {
    DOES_NOT_EXISTS: `Catalog with id '{catalogId}' does not exist or is not accessible by the current user.`,
  },
});
