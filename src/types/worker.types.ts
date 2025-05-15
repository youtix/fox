export type FoxArguments = {
  maxWorkers: number;
  templatePath: string;
  gekkoFolder: string;
};
export type WorkerArguments = {
  workerId: number;
  gekkoConfigFolderPath: string;
  configuration: string;
};
export type Primitive = string | number | boolean | null;
export type Template = Record<string, unknown>;
