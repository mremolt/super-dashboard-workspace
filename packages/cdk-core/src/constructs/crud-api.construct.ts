import type { IModel, JsonSchema, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { JsonSchemaType, LambdaIntegration, RequestValidator } from 'aws-cdk-lib/aws-apigateway';
import type { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { buildLambda } from '../api/api.functions';
import { DbTable } from '../db';

export interface CrudApiProps {
  api: RestApi;
  dbTableName: string;
  collectionName: string;
  entityName: string;
  path: Array<string>;
  entitySchema: JsonSchema;
  createSchema?: JsonSchema;
  updateSchema?: JsonSchema;
  functionProps?: NodejsFunctionProps;
}

export interface CrudLambdaFunctions {
  readCollectionHandler: NodejsFunction;
  readEntityHandler: NodejsFunction;
  createEntityHandler: NodejsFunction;
  updateEntityHandler: NodejsFunction;
  deleteEntityHandler: NodejsFunction;
}

export class CrudApi extends Construct {
  public readonly dbTable: DbTable;

  private readonly lambdaFunctions: CrudLambdaFunctions;

  constructor(private readonly scope: Construct, private readonly id: string, private readonly props: CrudApiProps) {
    super(scope, id);

    this.dbTable = new DbTable(scope, `${this.id}-${this.props.dbTableName}`);
    this.lambdaFunctions = this.buildLambdaFunctions();

    this.createCrudMethods();
    this.grantDbAccess();
  }

  private buildLambdaFunctions(): CrudLambdaFunctions {
    const readCollectionHandler = buildLambda(
      this.scope,
      `${this.props.api.restApiName}-read${this.props.collectionName}Handler`,
      this.props.path,
      'readAllHandler',
      this.props.functionProps,
    );

    const readEntityHandler = buildLambda(
      this.scope,
      `${this.props.api.restApiName}-read${this.props.entityName}Handler`,
      this.props.path,
      'readOneHandler',
      this.props.functionProps,
    );

    const createEntityHandler = buildLambda(
      this.scope,
      `${this.props.api.restApiName}-create${this.props.entityName}Handler`,
      this.props.path,
      'createHandler',
      this.props.functionProps,
    );

    const updateEntityHandler = buildLambda(
      this.scope,
      `${this.props.api.restApiName}-update${this.props.entityName}Handler`,
      this.props.path,
      'updateHandler',
      this.props.functionProps,
    );

    const deleteEntityHandler = buildLambda(
      this.scope,
      `${this.props.api.restApiName}-delete${this.props.entityName}Handler`,
      this.props.path,
      'deleteHandler',
      this.props.functionProps,
    );

    return { readCollectionHandler, readEntityHandler, createEntityHandler, updateEntityHandler, deleteEntityHandler };
  }

  private createCrudMethods(): void {
    const collectionResource = this.props.api.root.addResource(this.props.collectionName);
    const entityResource = collectionResource.addResource('{id}');

    const collectionSchema: JsonSchema = {
      type: JsonSchemaType.ARRAY,
      items: this.props.entitySchema,
    };

    const entityModelName = `${this.props.entityName}Model`;
    const entityModel = this.props.api.addModel(entityModelName, {
      schema: this.props.entitySchema,
      modelName: entityModelName,
    });

    const collectionModelName = `${this.props.entityName}CollectionModel`;
    const collectionModel = this.props.api.addModel(collectionModelName, {
      schema: collectionSchema,
      modelName: collectionModelName,
    });

    const createModels: { [key: string]: IModel } = {};
    const updateModels: { [key: string]: IModel } = {};

    if (this.props.createSchema) {
      const modelName = `Create${this.props.entityName}Model`;
      createModels['application/json'] = this.props.api.addModel(modelName, {
        schema: this.props.createSchema,
        modelName,
      });
    }

    if (this.props.updateSchema) {
      const modelName = `Update${this.props.entityName}Model`;
      updateModels['application/json'] = this.props.api.addModel(modelName, {
        schema: this.props.updateSchema,
        modelName,
      });
    }

    collectionResource.addMethod('GET', new LambdaIntegration(this.lambdaFunctions.readCollectionHandler), {
      methodResponses: [{ statusCode: '200', responseModels: { 'application/json': collectionModel } }],
    });
    collectionResource.addMethod('POST', new LambdaIntegration(this.lambdaFunctions.createEntityHandler), {
      requestModels: createModels,
      requestValidator: new RequestValidator(this.scope, `Create${this.props.entityName}Validator`, {
        restApi: this.props.api,
        validateRequestBody: true,
      }),
      methodResponses: [{ statusCode: '200', responseModels: { 'application/json': entityModel } }],
    });
    entityResource.addMethod('GET', new LambdaIntegration(this.lambdaFunctions.readEntityHandler), {
      methodResponses: [{ statusCode: '200', responseModels: { 'application/json': entityModel } }],
    });
    entityResource.addMethod('PUT', new LambdaIntegration(this.lambdaFunctions.updateEntityHandler), {
      requestModels: updateModels,
      requestValidator: new RequestValidator(this.scope, `Update${this.props.entityName}Validator`, {
        restApi: this.props.api,
        validateRequestBody: true,
      }),
      methodResponses: [{ statusCode: '200', responseModels: { 'application/json': entityModel } }],
    });
    entityResource.addMethod('DELETE', new LambdaIntegration(this.lambdaFunctions.deleteEntityHandler));
  }

  private grantDbAccess(): void {
    this.dbTable.initialize();

    this.dbTable.grantReadData(this.lambdaFunctions.readCollectionHandler);
    this.dbTable.grantReadData(this.lambdaFunctions.readEntityHandler);
    this.dbTable.grantWriteData(this.lambdaFunctions.createEntityHandler);
    this.dbTable.grantWriteData(this.lambdaFunctions.updateEntityHandler);
    this.dbTable.grantWriteData(this.lambdaFunctions.deleteEntityHandler);
  }
}
