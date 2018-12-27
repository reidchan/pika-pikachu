export interface Pikachu {
  (core: PikaCore, router?: PikaRouter, config?: PikaConfig): void

  /**
   * 使用Loader注入数据导app
   * @param name 名称
   * @param loader 加载器
   * @param injectCtx 是否注入到koa.context
   */
  injectData(name: string, loader, injectCtx)
}

export declare class PikaCore {
  constructor();

  service: boolean;
  router: boolean;
  jwt: boolean;
}

export declare class PikaRouter {
  constructor(prefix: string, port: number);

  prefix: string;
  port: number;
}

export declare class PikaConfig {
  constructor();

  jwt: object;
}

export declare class SequelizeProvider {
  constructor(config, modelRootPath);
}

export declare class RedisProvider {
  constructor(config);
}

export declare class RedisLockProvider {
  constructor(config);
}

export declare class ClassLoader {
  constructor(rootPath, suffix, namedBy);
}

export declare class BaseController {}

export declare class BaseService {}

interface Decorator {
  (target: any, key: string, descriptor: PropertyDescriptor): void
}

interface SingleDecorator {
  (value: any): Decorator
}

export const Get: SingleDecorator
export const Post: SingleDecorator
export const Put: SingleDecorator
export const Delete: SingleDecorator
export const Patch: SingleDecorator
export const Options: SingleDecorator
export const Head: SingleDecorator

export const Before: SingleDecorator
export const After: SingleDecorator
export const Message: SingleDecorator
export const IgnoreJwt: Decorator

export const IgnoreJwtAll: Function
export const BeforeAll: Function
export const AfterAll: Function