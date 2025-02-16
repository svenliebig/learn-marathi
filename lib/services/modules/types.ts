export interface Module {
  id: string;
  name: string;
  description: string;
}

export interface ModuleService {
  getModules(): Promise<Module[]>;
}
