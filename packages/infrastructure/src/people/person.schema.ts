import type { JsonSchema } from 'aws-cdk-lib/aws-apigateway';
import { JsonSchemaType } from 'aws-cdk-lib/aws-apigateway';

export const personSchema: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  properties: {
    id: {
      type: JsonSchemaType.STRING,
    },
    firstName: {
      type: JsonSchemaType.STRING,
    },
    lastName: {
      type: JsonSchemaType.STRING,
    },
  },
  required: ['firstName', 'lastName'],
  additionalProperties: false,
};
