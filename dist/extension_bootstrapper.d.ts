import { Container, IInstanceWrapper } from 'addict-ioc';
export interface IExtension {
    y: any;
    start(): Promise<void>;
    name?: string;
}
export declare class ExtensionBootstrapper {
    private _container;
    private _extensionDiscoveryTag;
    private _extensionInstances;
    constructor(_container: Container<IInstanceWrapper<any>>, _extensionDiscoveryTag: string);
    protected readonly container: Container<IInstanceWrapper<any>>;
    readonly extensionDiscoveryTag: string;
    readonly extensionInstances: Array<IExtension>;
    protected _registerInstanceToIocContainer(instance: IExtension): void;
    protected _discoverExtensionKeys(extensionDiscoveryTag: string): Array<string>;
    start(): Promise<void>;
    protected startExtensions(): Promise<Array<void>>;
    protected startExtension(instance: IExtension): Promise<void>;
    private _discoverExtensions();
}
