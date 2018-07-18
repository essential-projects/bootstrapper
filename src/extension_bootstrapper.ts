import {Container, IInstanceWrapper} from 'addict-ioc';

export interface IExtension {
  name?: string;

  start(): Promise<void>;
  stop(): Promise<void>;
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
    await this.startExtensions();
  }

  public async stop(): Promise<void> {
    await this.stopExtensions();
  }

  protected async startExtensions(): Promise<Array<void>> {
    const extensions: Array<IExtension> = await this._discoverExtensions();

    return Promise.all(extensions.map((extension: IExtension) => {
      return this.startExtension(extension);
    }));
  }

  protected async stopExtensions(): Promise<void> {
    for (const extensionInstance of this.extensionInstances) {
      await this.stopExtension(extensionInstance);
    }
  }

  protected async stopExtension(instance: IExtension): Promise<void> {
    await this.invokeAsPromiseIfPossible(instance.stop, instance);
  }

  protected async startExtension(instance: IExtension): Promise<void> {
    await this.invokeAsPromiseIfPossible(instance.start, instance);
    this.extensionInstances.push(instance);
  }

  private _discoverExtensions(): Promise<Array<IExtension>> {
    const discoveredExtensionKeys: Array<string> = this._discoverExtensionKeys(this.extensionDiscoveryTag);

    return Promise.all(discoveredExtensionKeys.map((extensionKey: string) => {
      return this.container.resolveAsync<IExtension>(extensionKey);
    }));
  }

  // Taken from the foundation, to remove the need for that package.
  private invokeAsPromiseIfPossible(functionToInvoke: any, invocationContext: any, invocationParameter?: Array<any>): Promise<any> {

    return new Promise((resolve: any, reject: any): void => {

      const isValidFunction: boolean = functionToInvoke !== undefined &&
                                       functionToInvoke !== null &&
                                       typeof functionToInvoke === 'function';

      if (!isValidFunction) {
        return resolve();
      }

      let result: any;
      try {
        result = functionToInvoke.call(invocationContext, invocationParameter);
      } catch (error) {
        return reject(error);
      }

      resolve(result);
    });
  }

}
