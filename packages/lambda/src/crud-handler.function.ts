import type { Handler } from 'aws-cdk-lib/aws-lambda';
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

import type { Collection } from './collection.class';
import type { Entity } from './entity.type';

const notFoundResponse = {
  statusCode: 404,
  body: '',
};

export interface CrudHandler {
  readAllHandler: Handler;
  readOneHandler: Handler;
  createHandler: Handler;
  updateHandler: Handler;
  deleteHandler: Handler;
}

export function buildErrorResponse(error: unknown): APIGatewayProxyResult {
  let message = '';

  if (error instanceof Error) {
    message = error.message;
  }

  return {
    statusCode: 400,
    body: JSON.stringify(message),
  };
}

export function buildCrudHandler<T extends Entity>(collection: Collection<T>): CrudHandler {
  const readAllHandler: Handler = async (): Promise<APIGatewayProxyResult> => {
    const items = await collection.readAll();

    return {
      statusCode: 200,
      body: JSON.stringify(items),
    };
  };

  const readOneHandler: Handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;

    if (!id) {
      return notFoundResponse;
    }

    try {
      const item = await collection.readOne(id);

      return {
        statusCode: 200,
        body: JSON.stringify(item),
      };
    } catch (error) {
      return notFoundResponse;
    }
  };

  const createHandler: Handler = async (event: APIGatewayEvent) => {
    const createItem: Omit<T, 'id'> = JSON.parse(event.body || '{}');

    try {
      const item = await collection.create(createItem);

      return {
        statusCode: 201,
        body: JSON.stringify(item),
      };
    } catch (error) {
      return buildErrorResponse(error);
    }
  };

  const updateHandler: Handler = async (event: APIGatewayEvent) => {
    const updateItem: T = JSON.parse(event.body || '{}');

    try {
      const item = await collection.update(updateItem);

      return {
        statusCode: 202,
        body: JSON.stringify(item),
      };
    } catch (error) {
      return buildErrorResponse(error);
    }
  };

  const deleteHandler: Handler = async (event: APIGatewayEvent) => {
    const id = event.pathParameters?.id;

    if (!id) {
      return notFoundResponse;
    }

    try {
      await collection.delete(id);

      return {
        statusCode: 202,
        body: '',
      };
    } catch (error) {
      return buildErrorResponse(error);
    }
  };

  return {
    readAllHandler,
    readOneHandler,
    createHandler,
    updateHandler,
    deleteHandler,
  };
}
