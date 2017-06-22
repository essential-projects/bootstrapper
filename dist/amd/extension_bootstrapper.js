define(["require", "exports", "@process-engine-js/utils", "bluebird"], function (require, exports, utils_1, bluebirdPromise) {
    "use strict";
    class ExtensionBootstrapper {
        constructor(_container, _extensionDiscoveryTag) {
            this._extensionInstances = [];
            this._isInitialized = false;
            this._container = _container;
            this._extensionDiscoveryTag = _extensionDiscoveryTag;
            if (typeof _container === 'undefined') {
                throw new Error('IoC container is required.');
            }
            this._registerInstanceToIocContainer(this);
        }
        get isInitialized() {
            return this._isInitialized;
        }
        set isInitialized(initialize) {
            this._isInitialized = initialize;
        }
        get container() {
            return this._container;
        }
        get extensionDiscoveryTag() {
            return this._extensionDiscoveryTag;
        }
        get extensionInstances() {
            return this._extensionInstances;
        }
        _registerInstanceToIocContainer(instance) {
            const registrationKey = `${this.extensionDiscoveryTag}Bootstrapper`;
            if (!this.container.isRegistered(registrationKey)) {
                this.container.registerObject(registrationKey, instance);
            }
        }
        async initialize() {
            if (!this.isInitialized) {
                await this.initializeExtensions();
                this.isInitialized = true;
            }
        }
        _discoverExtensionKeys(extensionDiscoveryTag) {
            return this.container.getKeysByTags(extensionDiscoveryTag);
        }
        initializeExtensions() {
            const discoveredExtensionKeys = this._discoverExtensionKeys(this.extensionDiscoveryTag);
            const serialPromise = bluebirdPromise.mapSeries(discoveredExtensionKeys, (extensionKey) => {
                return this.initializeExtension(extensionKey);
            });
            return serialPromise;
        }
        async initializeExtension(extensionKey) {
            const instance = this.container.resolve(extensionKey);
            await utils_1.executeAsExtensionHookAsync(instance.initialize, instance);
            this[instance.name] = instance;
            this.extensionInstances.push(instance);
        }
        async start() {
            await this.initialize();
            await this.startExtensions();
        }
        startExtensions() {
            const serialPromise = bluebirdPromise.mapSeries(this.extensionInstances, (extensionInstance) => {
                return this.startExtension(extensionInstance);
            });
            return serialPromise;
        }
        async startExtension(instance) {
            await utils_1.executeAsExtensionHookAsync(instance.start, instance);
        }
    }
    exports.ExtensionBootstrapper = ExtensionBootstrapper;
});

//# sourceMappingURL=extension_bootstrapper.js.map
