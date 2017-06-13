import { Container, IInstanceWrapper } from 'addict-ioc';
export interface IExtension {
    initialize(): Promise<void>;
    start(): Promise<void>;
    name?: string;
}
export declare class ExtensionBootstrapper {
    private _container;
    private _extensionDiscoveryTag;
    private _extensionInstances;
    private _isInitialized;
    constructor(_container: Container<IInstanceWrapper<any>>, _extensionDiscoveryTag: string);
    protected isInitialized: boolean;
    protected readonly container: Container<IInstanceWrapper<any>>;
    readonly extensionDiscoveryTag: string;
    readonly extensionInstances: Array<IExtension>;
    protected _registerInstanceToIocContainer(instance: IExtension): void;
    initialize(): Promise<void>;
    protected _discoverExtensionKeys(extensionDiscoveryTag: string): Array<string>;
    protected initializeExtensions(): Promise<any>;
    protected initializeExtension(extensionKey: string): Promise<void>;
    start(): Promise<void>;
    protected startExtensions(): Promise<any>;
    protected startExtension(instance: IExtension): Promise<void>;
}
