var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "@process-engine-js/utils", "bluebird"], function (require, exports, utils_1, bluebirdPromise) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        initialize() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.isInitialized) {
                    yield this.initializeExtensions();
                    this.isInitialized = true;
                }
            });
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
        initializeExtension(extensionKey) {
            return __awaiter(this, void 0, void 0, function* () {
                const instance = this.container.resolve(extensionKey);
                yield utils_1.executeAsExtensionHookAsync(instance.initialize, instance);
                this[instance.name] = instance;
                this.extensionInstances.push(instance);
            });
        }
        start() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initialize();
                yield this.startExtensions();
            });
        }
        startExtensions() {
            const serialPromise = bluebirdPromise.mapSeries(this.extensionInstances, (extensionInstance) => {
                return this.startExtension(extensionInstance);
            });
            return serialPromise;
        }
        startExtension(instance) {
            return __awaiter(this, void 0, void 0, function* () {
                yield utils_1.executeAsExtensionHookAsync(instance.start, instance);
            });
        }
    }
    exports.ExtensionBootstrapper = ExtensionBootstrapper;
});

//# sourceMappingURL=extension_bootstrapper.js.map
