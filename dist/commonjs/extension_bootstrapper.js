"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@process-engine-js/utils");
class ExtensionBootstrapper {
    constructor(_container, _extensionDiscoveryTag) {
        this._extensionInstances = [];
        this._container = _container;
        this._extensionDiscoveryTag = _extensionDiscoveryTag;
        if (typeof _container === 'undefined') {
            throw new Error('IoC container is required.');
        }
        this._registerInstanceToIocContainer(this);
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
    _discoverExtensionKeys(extensionDiscoveryTag) {
        return this.container.getKeysByTags(extensionDiscoveryTag);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.startExtensions();
        });
    }
    startExtensions() {
        return __awaiter(this, void 0, void 0, function* () {
            const extensions = yield this._discoverExtensions();
            return Promise.all(extensions.map((extension) => {
                return this.startExtension(extension);
            }));
        });
    }
    startExtension(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield utils_1.executeAsExtensionHookAsync(instance.start, instance);
        });
    }
    _discoverExtensions() {
        const discoveredExtensionKeys = this._discoverExtensionKeys(this.extensionDiscoveryTag);
        return Promise.all(discoveredExtensionKeys.map((extensionKey) => {
            return this.container.resolveAsync(extensionKey);
        }))
            .catch((error) => {
            throw error;
        });
    }
}
exports.ExtensionBootstrapper = ExtensionBootstrapper;

//# sourceMappingURL=extension_bootstrapper.js.map
