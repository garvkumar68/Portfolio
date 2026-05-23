export type CMSFile = string;

export interface DBState {
  [key: string]: {
    content: any;
    sha: string;
    schema?: any[];
    type?: "list" | "object" | "tags" | "categories";
    title?: string;
    schemaSha?: string;
    isSystemFile?: boolean;
    readOnly?: boolean;
    isStandard?: boolean;
  };
}
