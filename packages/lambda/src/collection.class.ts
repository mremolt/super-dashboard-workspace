/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 } from 'uuid';

import type { Entity } from './entity.type';

export class Collection<T extends Entity> {
  private readonly dbClient = DynamoDBDocumentClient.from(new DynamoDB({}));

  constructor(private readonly tableName: string, private readonly partitionKey: string = 'id') {}

  public async readAll(): Promise<Array<T>> {
    const result = await this.dbClient.send(new ScanCommand({ TableName: this.tableName }));
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    console.log({ message: 'the message', items: result.Items });
    return result.Items as Array<T>;
  }

  public async readOne(id: string, errorOnNotFound = true): Promise<T | undefined> {
    const result = await this.dbClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { [this.partitionKey]: id },
      }),
    );

    if (errorOnNotFound && !Boolean(result.Item)) {
      throw new Error(`Item with ID ${id} not found in table ${this.tableName}.`);
    }

    return result.Item as T;
  }

  public async create(createItem: Omit<T, 'id'>): Promise<T> {
    const item = { ...createItem, id: v4() } as unknown as T;

    try {
      await this.dbClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: item,
        }),
      );

      return item;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async update(updateItem: T): Promise<T> {
    try {
      await this.dbClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: updateItem,
        }),
      );

      return updateItem;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async delete(id: string): Promise<undefined> {
    try {
      await this.dbClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            [this.partitionKey]: id,
          },
        }),
      );

      return undefined;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
