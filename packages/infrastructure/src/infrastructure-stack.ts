import { CrudApi } from '@mr/cdk-core';
import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import type { Construct } from 'constructs';

import { CRUD_API_NAME, PEOPLE_TABLE_NAME } from './people/constants';
import { personSchema } from './people/person.schema';

export class InfrastructureStack extends Stack {
  public readonly crudApi: CrudApi;

  private readonly api = new RestApi(this, 'dashboard-api');

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.crudApi = new CrudApi(this, CRUD_API_NAME, {
      api: this.api,
      dbTableName: PEOPLE_TABLE_NAME,
      entityName: 'Person',
      collectionName: 'People',
      path: [__dirname, 'people', 'people.handler.ts'],
      functionProps: { memorySize: 256 },
      entitySchema: personSchema,
      createSchema: personSchema,
      updateSchema: personSchema,
    });
  }
}
