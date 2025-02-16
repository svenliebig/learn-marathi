import { Module, ModuleService } from './types';

class MarathiToLatinModule implements Module {
  public readonly id = 'marathi-to-latin';
  public readonly name = 'Marathi to Latin';
  public readonly description = 'Practice translating Marathi letters to Latin script';
}

class LatinToMarathiModule implements Module {
  public readonly id = 'latin-to-marathi';
  public readonly name = 'Latin to Marathi';
  public readonly description = 'Practice translating Latin script to Marathi letters';
}

class StaticModuleService implements ModuleService {
  getModules(): Promise<Module[]> {
    return Promise.resolve([new MarathiToLatinModule(), new LatinToMarathiModule()]);
  }
}

export const moduleService = new StaticModuleService();
