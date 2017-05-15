import {executeAsExtensionHookAsync as extensionHook} from '@process-engine-js/utils';
import { DependencyInjectionContainer as Container } from 'addict-ioc';
import * as bluebirdPromise from 'bluebird';

export interface IExtension {
  initialize(): Promise<void>;
  start(): Promise<void>;
  name?: string;
}

export class ExtensionBootstrapper {

  private _container: Container;
  private _extensionDiscoveryTag: string;
  private _extensionInstances: Array<IExtension> = [];
  private _isInitialized: boolean = false;

  constructor(_container: Container, _extensionDiscoveryTag: string) {

    this._container = _container;
    this._extensionDiscoveryTag = _extensionDiscoveryTag;

    if (typeof _container === 'undefined') {
      throw new Error('IoC container is required.');
    }

    this._registerInstanceToIocContainer(this);
  }

  protected get isInitialized(): boolean {
    return this._isInitialized;
  }

  protected set isInitialized(initialize: boolean) {
    this._isInitialized = initialize;
  }

  protected get container(): Container {
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

  public async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeExtensions();
      this.isInitialized = true;
    }
  }

  protected _discoverExtensionKeys(extensionDiscoveryTag: string): Array<string> {
    return this.container.getKeysByTags(extensionDiscoveryTag);
  }

  // tslint:disable-next-line
  protected initializeExtensions(): Promise<any> {

    const discoveredExtensionKeys: Array<string> = this._discoverExtensionKeys(this.extensionDiscoveryTag);
    // tslint:disable-next-line
    const serialPromise: Promise<any> = bluebirdPromise.mapSeries(discoveredExtensionKeys, (extensionKey: string) => {
      return this.initializeExtension(extensionKey);
    });

    return serialPromise;
  }

  protected async initializeExtension(extensionKey: string): Promise<void> {
    const instance: IExtension = this.container.resolve(extensionKey);

    await extensionHook(instance.initialize, instance);
    this[instance.name] = instance;
    this.extensionInstances.push(instance);
  }

  public async start(): Promise<void> {
    await this.initialize();
    await this.startExtensions();
  }

  // tslint:disable-next-line
  protected startExtensions(): Promise<any> {
    // tslint:disable-next-line
    const serialPromise: Promise<any> = bluebirdPromise.mapSeries(this.extensionInstances, (extensionInstance: any) => {
      return this.startExtension(extensionInstance);
    });
    return serialPromise;

  }

  protected async startExtension(instance: IExtension): Promise<void> {
    await extensionHook(instance.start, instance);
  }

}
