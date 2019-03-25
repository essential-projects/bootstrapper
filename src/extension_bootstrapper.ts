import {Container, IInstanceWrapper} from 'addict-ioc';

import {disposableDiscoveryTag, extensionDiscoveryTag} from '@essential-projects/bootstrapper_contracts';

export interface IExtension {
  name?: string;

  start(): Promise<void>;
  stop(): Promise<void>;
}

export class ExtensionBootstrapper {

  private _container: Container<IInstanceWrapper<any>>;
  private _extensionDiscoveryTag: string;
  private _extensionInstances: Array<IExtension> = [];

  constructor(container: Container<IInstanceWrapper<any>>, customExtensionDiscoveryTag: string) {

    this._container = container;
    this._extensionDiscoveryTag = customExtensionDiscoveryTag || extensionDiscoveryTag;

    if (typeof container === 'undefined') {
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

  public async start(): Promise<void> {
    await this.startExtensions();
  }

  public async stop(): Promise<void> {
    await this.stopExtensions();
    await this.disposeByTags();
  }

  protected async startExtensions(): Promise<Array<void>> {
    const extensions: Array<IExtension> = await this._discoverExtensions();

    return Promise.all(extensions.map((extension: IExtension) => {
      return this.startExtension(extension);
    }));
  }

  protected async startExtension(instance: IExtension): Promise<void> {
    await this.invokeAsPromiseIfPossible(instance.start, instance);
    this.extensionInstances.push(instance);
  }

  protected async stopExtensions(): Promise<void> {
    for (const extensionInstance of this.extensionInstances) {
      await this.stopExtension(extensionInstance);
    }
  }

  protected async stopExtension(instance: IExtension): Promise<void> {
    await this.invokeAsPromiseIfPossible(instance.stop, instance);
  }

  protected async disposeByTags(): Promise<void> {
    const discoveredDisposableKeys: Array<string> = this.container.getKeysByTags(disposableDiscoveryTag);

    for (const registrationKey of discoveredDisposableKeys) {
      const instance: any = await this.container.resolveAsync<IExtension>(registrationKey);
      await this.invokeAsPromiseIfPossible(instance.dispose, instance);
    }
  }

  protected async _discoverExtensions(): Promise<Array<IExtension>> {
    const discoveredExtensionKeys: Array<string> = this.container.getKeysByTags(this.extensionDiscoveryTag);
    
    const instances: Array<any> = [];
    
    for (const registrationKey of discoveredExtensionKeys) {
      const instance: any = await this.container.resolveAsync<IExtension>(registrationKey);
      instances.push(instance);
    }

    return instances;
  }

  private async invokeAsPromiseIfPossible(functionToInvoke: any, invocationContext: any, invocationParameter?: Array<any>): Promise<any> {

    const isValidFunction: boolean = typeof functionToInvoke === 'function';
    if (!isValidFunction) {
      return;
    }

    return await functionToInvoke.call(invocationContext, invocationParameter);
  }

}
