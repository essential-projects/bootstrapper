import {executeAsExtensionHookAsync as extensionHook} from '@process-engine-js/utils';
import {Container, IInstanceWrapper} from 'addict-ioc';
import * as bluebirdPromise from 'bluebird';

export interface IExtension {
  start(): Promise<void>;
  name?: string;
}

export class ExtensionBootstrapper {

  private _container: Container<IInstanceWrapper<any>>;
  private _extensionDiscoveryTag: string;
  private _extensionInstances: Array<IExtension> = [];

  constructor(_container: Container<IInstanceWrapper<any>>, _extensionDiscoveryTag: string) {

    this._container = _container;
    this._extensionDiscoveryTag = _extensionDiscoveryTag;

    if (typeof _container === 'undefined') {
      throw new Error('IoC container is required.');
    }

    this._registerInstanceToIocContainer(this);
  }

  protected get container(): Container<IInstanceWrapper<any>> {
    return this._container;
  }

  public get extensionDiscoveryTag(): string {
    return this._extensionDiscoveryTag;
  }

  public get extensionInstances(): Array<IExtension> {
    return this._extensionInstances;
  }

  protected _registerInstanceToIocContainer(instance: IExtension): void {

    const registrationKey: string = `${this.extensionDiscoveryTag}Bootstrapper`;

    if (!this.container.isRegistered(registrationKey)) {

      this.container.registerObject(registrationKey, instance);
    }
  }

  protected _discoverExtensionKeys(extensionDiscoveryTag: string): Array<string> {
    return this.container.getKeysByTags(extensionDiscoveryTag);
  }

  public async start(): Promise<void> {
    console.log('-----------------asdasd');
    await this.startExtensions();
  }

  protected async startExtensions(): Promise<Array<void>> {
    const extensions: Array<IExtension> = await this._discoverExtensions();
    console.log(extensions);
    return Promise.all(extensions.map((extension: IExtension) => {
      return this.startExtension(extension); 
    }));
  }

  protected async startExtension(instance: IExtension): Promise<void> {
    await extensionHook(instance.start, instance);
  }

  private _discoverExtensions(): Promise<Array<IExtension>> {
    const discoveredExtensionKeys: Array<string> = this._discoverExtensionKeys(this.extensionDiscoveryTag);
    return Promise.all(discoveredExtensionKeys.map((extensionKey: string) => {
      console.log('resolve extension', extensionKey);
      return this.container.resolveAsync(extensionKey)
    }))
    .catch((error: Error) => {
      console.log('discover extensions error', error);
      throw error;
    });
  }

}
