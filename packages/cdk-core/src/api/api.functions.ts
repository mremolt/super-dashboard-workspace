import { Runtime } from 'aws-cdk-lib/aws-lambda';
import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';
import { join } from 'path';

export function buildLambda(
  stack: Construct,
  name: string,
  lambdaPath: Array<string>,
  handler: string,
  props: NodejsFunctionProps = {},
): NodejsFunction {
  return new NodejsFunction(stack, name, {
    runtime: Runtime.NODEJS_18_X,
    entry: join(...lambdaPath),
    handler,

    bundling: {
      minify: true,
      externalModules: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb'],
    },
    functionName: name,
    ...props,
  });
}
