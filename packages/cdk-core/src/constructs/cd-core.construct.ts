import { Construct } from 'constructs';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CdkCoreProps {
  // Define construct properties here
}

export class CdkCore extends Construct {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(scope: Construct, id: string, _props: CdkCoreProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkCoreQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
