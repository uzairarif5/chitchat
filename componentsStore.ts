import fs from 'node:fs';
import { inProduction } from '.';

class ComponentsStoreClass {
  storage: {[key: string]: string | undefined};

  constructor(){
    this.storage = {
      home: undefined,
      avatarContainer: undefined,
      room: undefined
    };

    Object.seal(this.storage);
  }

  getComponent(compName: string, includeJs?: boolean){
    if (!(compName in this.storage)) throw new Error(`Property ${compName} is not storage.`);
    if (this.storage[compName]) return this.storage[compName];
    else {
      let data: string | undefined = fs.readFileSync(`components/${compName}.html`, 'utf8');
      if (data && !inProduction) this.storage[compName] = data;
      return data;
    }
  }
}

const componentsStore = new ComponentsStoreClass();

export default componentsStore;