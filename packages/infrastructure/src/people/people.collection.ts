import type { Entity } from '@mr/lambda';
import { Collection } from '@mr/lambda';

import { CRUD_API_NAME, PEOPLE_TABLE_NAME } from './constants';

export interface Person extends Entity {
  id: string;
  firstName: string;
  lastName: string;
}

export class PeopleCollection extends Collection<Person> {
  constructor() {
    super(`${CRUD_API_NAME}-${PEOPLE_TABLE_NAME}`);
  }
}
