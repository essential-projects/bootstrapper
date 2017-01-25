'use strict';

const path = require('path');
const Promise = require('bluebird');

const containerGlobalConfigurationBridge = require('addict-ioc-nconf').configureAddictIocWithNconf;
const extensionHook = require('@process-engine-js/utils').executeAsExtensionHookAsync;

const extensionDiscoveryTag = 'extension';

class Bootstrapper {

  constructor(container, appRoot) {

    this._initialized = false;

    if (typeof container === 'undefined') {
      throw new Error('IoC container is required.');
    }

    if (!appRoot) {
      appRoot = process.cwd();
    }

    this._appRoot = path.normalize(appRoot);
    this._env = process.env.NODE_ENV || 'development';
    this._logLevel = process.env.LOG_LEVEL || 'warn';

    this._container = container;

    this._extensions = [];

    this._extensionInstances = [];

    this.container.registerObject('bootstrapper', this);
  }

  get initialized() {
    return this._initialized;
  }

  get appRoot() {
    return this._appRoot;
  }

  get container() {
    return this._container;
  }

  get env() {
    return this._env;
  }

  get logLevel() {
    return this._logLevel;
  }

  get extensions() {
    return this._extensions;
  }

  extension(name) {
    return this.extensions[name];
  }

  get extensionInstances() {
    return this._extensionInstances;
  }

  initializeLogging() {
  }

  initialize() {

    this.initializeLogging();

    containerGlobalConfigurationBridge(this.container, {configPath: this.configPath, env: this.env});

    return this.initializeExtensions();
  }

  initializeExtensions() {

    const discoveredExtensionKeys = this.container.getKeysByTags(extensionDiscoveryTag);

    const serialPromise = discoveredExtensionKeys.reduce((prevPromise, extensionKey) => {

      return prevPromise.then(() => {
        return this.initializeExtension(extensionKey).bind(this);
      });

    }, Promise.resolve());

    return serialPromise;
  }

  initializeExtension(extensionKey) {

    const instance = this.container.resolve(extensionKey);

    return extensionHook(instance.initialize, instance)
      .then(() => {

        this[instance.name] = instance;
        this.extensionInstances.push(instance);
      });
  }

  start() {

    return this.initialize()
      .then(() => {

        return this.startExtensions();
      });
  }

  startExtensions() {

    const serialPromise = this.extensionInstances.reduce((prevPromise, extensionInstance) => {

      return prevPromise.then(() => {
        return this.startExtension(extensionInstance).bind(this);
      });

    }, Promise.resolve());

    return serialPromise;
  }

  startExtension(instance) {

    return extensionHook(instance.start, instance);
  }
}

module.exports = Bootstrapper;
module.exports.extensionDiscoveryTag = extensionDiscoveryTag;
