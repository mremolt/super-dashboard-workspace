import { buildCrudHandler } from '@mr/lambda';

import { PeopleCollection } from './people.collection';

const peopleCollection = new PeopleCollection();

export const { readAllHandler, readOneHandler, createHandler, updateHandler, deleteHandler } =
  buildCrudHandler(peopleCollection);
