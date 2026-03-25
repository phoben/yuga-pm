/**
 * yg-diagram - Canvas 图表渲染引擎
 * 基于 Konva.js 实现
 */

import { DEFAULT_CONFIG, THEMES, DIAGRAM_TYPES } from './config.js';
import { DiagramCore } from './core.js';

class YGDiagram {
  constructor() {
    this.instances = new Map();
  }

  /**
   * 渲染图表到指定容器
   * @param {HTMLElement|string} container - 容器元素或选择器
   * @param {Object} config - 图表配置
   * @returns {Object} 渲染实例
   */
  render(container, config) {
    // 支持选择器或元素
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!el) {
      throw new Error('YGDiagram: Container not found');
    }

    // 验证配置
    this.validateConfig(config);

    // 合并默认配置
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      theme: THEMES[config.theme || 'light'],
    };

    // 创建渲染实例
    const instance = new DiagramCore(el, mergedConfig);
    const instanceId = `diagram-${Date.now()}`;
    this.instances.set(instanceId, instance);

    return instance;
  }

  /**
   * 验证图表配置
   */
  validateConfig(config) {
    if (!config.type) {
      throw new Error('YGDiagram: Missing required field "type"');
    }
    if (!DIAGRAM_TYPES.includes(config.type)) {
      throw new Error(`YGDiagram: Unknown diagram type "${config.type}"`);
    }
  }

  /**
   * 销毁图表实例
   */
  destroy(instanceId) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.destroy();
      this.instances.delete(instanceId);
    }
  }

  /**
   * 销毁所有实例
   */
  destroyAll() {
    this.instances.forEach(instance => instance.destroy());
    this.instances.clear();
  }
}

// 全局单例
const ygDiagram = new YGDiagram();

// 挂载到 window（用于 CDN 引入）
if (typeof window !== 'undefined') {
  window.YGDiagram = ygDiagram;
}

export default ygDiagram;
export { YGDiagram, DEFAULT_CONFIG, THEMES };