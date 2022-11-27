import type { TableProps } from 'aws-cdk-lib/aws-dynamodb';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import type { IGrantable } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

export class DbTable {
  private table?: Table;

  constructor(
    private readonly stack: Construct,
    private readonly tableName: string,
    private readonly partitionKey: string = 'id',
    private readonly props: Partial<TableProps> = {},
  ) {}

  public initialize(): void {
    this.table = new Table(this.stack, this.tableName, {
      tableName: this.tableName,
      partitionKey: {
        name: this.partitionKey,
        type: AttributeType.STRING,
      },
      ...this.props,
    });
  }

  public grantReadData(grantee: IGrantable): void {
    this.table?.grantReadData(grantee);
  }

  public grantWriteData(grantee: IGrantable): void {
    this.table?.grantWriteData(grantee);
  }
}
