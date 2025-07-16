export interface SetupModule {
  name: string;
  description: string;
  dependencies?: string[];
  devDependencies?: string[];
  install(): Promise<void>;
}

export interface SetupConfig {
  prettier: boolean;
  bitsUi: boolean;
}