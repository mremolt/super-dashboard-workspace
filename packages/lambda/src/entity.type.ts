// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Entity extends Record<string, any> {
  id: string;
}

export type CreateEntity = Omit<Entity, 'id'>;
