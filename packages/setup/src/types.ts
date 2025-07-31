export interface SetupModule {
  name: string;
  description: string;
  dependencies?: string[];
  devDependencies?: string[];
  install(options?: any): Promise<void>;
}

export interface SetupConfig {
  prettier: boolean;
  bitsUi: boolean;
}