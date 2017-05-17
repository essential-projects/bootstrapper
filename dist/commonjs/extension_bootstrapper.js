"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@process-engine-js/utils");
var bluebirdPromise = require("bluebird");
var ExtensionBootstrapper = (function () {
    function ExtensionBootstrapper(_container, _extensionDiscoveryTag) {
        this._extensionInstances = [];
        this._isInitialized = false;
        this._container = _container;
        this._extensionDiscoveryTag = _extensionDiscoveryTag;
        if (typeof _container === 'undefined') {
            throw new Error('IoC container is required.');
        }
        this._registerInstanceToIocContainer(this);
    }
    Object.defineProperty(ExtensionBootstrapper.prototype, "isInitialized", {
        get: function () {
            return this._isInitialized;
        },
        set: function (initialize) {
            this._isInitialized = initialize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExtensionBootstrapper.prototype, "container", {
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExtensionBootstrapper.prototype, "extensionDiscoveryTag", {
        get: function () {
            return this._extensionDiscoveryTag;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExtensionBootstrapper.prototype, "extensionInstances", {
        get: function () {
            return this._extensionInstances;
        },
        enumerable: true,
        configurable: true
    });
    ExtensionBootstrapper.prototype._registerInstanceToIocContainer = function (instance) {
        var registrationKey = this.extensionDiscoveryTag + "Bootstrapper";
        if (!this.container.isRegistered(registrationKey)) {
            this.container.registerObject(registrationKey, instance);
        }
    };
    ExtensionBootstrapper.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isInitialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initializeExtensions()];
                    case 1:
                        _a.sent();
                        this.isInitialized = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ExtensionBootstrapper.prototype._discoverExtensionKeys = function (extensionDiscoveryTag) {
        return this.container.getKeysByTags(extensionDiscoveryTag);
    };
    ExtensionBootstrapper.prototype.initializeExtensions = function () {
        var _this = this;
        var discoveredExtensionKeys = this._discoverExtensionKeys(this.extensionDiscoveryTag);
        var serialPromise = bluebirdPromise.mapSeries(discoveredExtensionKeys, function (extensionKey) {
            return _this.initializeExtension(extensionKey);
        });
        return serialPromise;
    };
    ExtensionBootstrapper.prototype.initializeExtension = function (extensionKey) {
        return __awaiter(this, void 0, void 0, function () {
            var instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        instance = this.container.resolve(extensionKey);
                        return [4 /*yield*/, utils_1.executeAsExtensionHookAsync(instance.initialize, instance)];
                    case 1:
                        _a.sent();
                        this[instance.name] = instance;
                        this.extensionInstances.push(instance);
                        return [2 /*return*/];
                }
            });
        });
    };
    ExtensionBootstrapper.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.startExtensions()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ExtensionBootstrapper.prototype.startExtensions = function () {
        var _this = this;
        var serialPromise = bluebirdPromise.mapSeries(this.extensionInstances, function (extensionInstance) {
            return _this.startExtension(extensionInstance);
        });
        return serialPromise;
    };
    ExtensionBootstrapper.prototype.startExtension = function (instance) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.executeAsExtensionHookAsync(instance.start, instance)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ExtensionBootstrapper;
}());
exports.ExtensionBootstrapper = ExtensionBootstrapper;

//# sourceMappingURL=extension_bootstrapper.js.map
