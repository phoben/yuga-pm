/**
 * yg-diagram - Canvas 图表渲染引擎 (IIFE Bundle)
 * 基于 Konva.js 实现，可直接在浏览器中使用
 *
 * 使用方式：
 * <script src="path/to/bundle.js"></script>
 * <script>
 *   YGDiagram.render('#container', config);
 * </script>
 */
(function(global) {
  'use strict';

  // ============================================
  // config.js - 默认配置
  // ============================================
  const DEFAULT_CONFIG = {
    padding: 40,
    nodeSpacing: { x: 80, y: 60 },
    fontSize: { title: 16, label: 14, edge: 12 },
    borderRadius: 8,
  };

  const THEMES = {
    light: {
      background: '#ffffff',
      text: '#1e293b',
      node: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        tertiary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
        neutral: '#64748b',
      },
      edge: {
        default: '#94a3b8',
        highlight: '#3b82f6',
      },
    },
    dark: {
      background: '#1e293b',
      text: '#f1f5f9',
      node: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        tertiary: '#94a3b8',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#22d3ee',
        neutral: '#94a3b8',
      },
      edge: {
        default: '#64748b',
        highlight: '#60a5fa',
      },
    },
    minimal: {
      background: '#ffffff',
      text: '#334155',
      node: {
        primary: '#64748b',
        secondary: '#64748b',
        tertiary: '#64748b',
        success: '#64748b',
        warning: '#64748b',
        danger: '#64748b',
        info: '#64748b',
        neutral: '#64748b',
      },
      edge: {
        default: '#94a3b8',
        highlight: '#64748b',
      },
    },
    colorful: {
      background: '#ffffff',
      text: '#1e293b',
      node: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        tertiary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
        neutral: '#64748b',
      },
      edge: {
        default: '#94a3b8',
        highlight: '#3b82f6',
      },
      gradients: true,
    },
  };

  const DIAGRAM_TYPES = [
    'flowchart',
    'architecture',
    'sequence',
    'statechart',
    'er-diagram',
    'gantt',
    'mindmap',
    'network',
  ];

  // ============================================
  // core.js - 核心渲染器
  // ============================================
  class DiagramCore {
    constructor(container, config) {
      this.container = container;
      this.config = config;
      this.stage = null;
      this.mainLayer = null;
      this.titleLayer = null;
      this.nodes = new Map();
      this.edges = [];

      this.init();
    }

    init() {
      // 计算画布尺寸
      const rect = this.container.getBoundingClientRect();
      const width = rect.width || 800;
      const height = Math.max(rect.height || 400, 400);

      // 创建 Konva Stage (使用全局 Konva 对象)
      this.stage = new Konva.Stage({
        container: this.container,
        width,
        height,
      });

      // 创建标题图层
      this.titleLayer = new Konva.Layer();
      this.stage.add(this.titleLayer);

      // 创建主图层
      this.mainLayer = new Konva.Layer();
      this.stage.add(this.mainLayer);

      // 渲染背景
      this.renderBackground();

      // 渲染标题
      this.renderTitle();

      // 根据图表类型渲染
      this.renderDiagram();
    }

    renderBackground() {
      this.container.style.backgroundColor = this.config.theme.background;
    }

    renderTitle() {
      if (this.config.title) {
        const title = new Konva.Text({
          text: this.config.title,
          fontSize: this.config.fontSize.title,
          fontStyle: '600',
          fill: this.config.theme.text,
          x: this.stage.width() / 2,
          y: 10,
          align: 'center',
        });
        title.offsetX(title.width() / 2);
        this.titleLayer.add(title);
      }
    }

    renderDiagram() {
      const positions = this.calculateLayout();

      // 1. 渲染连线（先于节点，避免遮挡）
      this.renderEdges(positions.edges);

      // 2. 渲染节点
      this.renderNodes(positions.nodes);

      // 3. 渲染层级标签（架构图）
      if (positions.layerLabels) {
        this.renderLayerLabels(positions.layerLabels);
      }

      // 4. 应用交互
      this.applyInteractions();

      // 5. 自适应视图
      this.fitToView();
    }

    /**
     * 计算布局 - 支持多种图表类型
     */
    calculateLayout() {
      const type = this.config.type;
      const nodes = [];
      const edges = [];
      const layerLabels = [];

      // 计算起始 Y 偏移（为标题留空间）
      const startY = this.config.title ? 50 : 20;
      const spacing = this.config.nodeSpacing;

      // 获取节点列表（支持 nodes 和 layers 两种结构）
      let nodeList = [];
      let edgeList = [];

      if (type === 'architecture' && this.config.layers) {
        // 架构图：处理 layers 结构
        let layerY = startY;
        const layerSep = 100;
        const nodeSep = 30;
        const nodeWidth = 120;
        const nodeHeight = 50;

        this.config.layers.forEach((layer, layerIndex) => {
          // 记录层级标签
          layerLabels.push({
            label: layer.label,
            x: 20,
            y: layerY + nodeHeight / 2,
          });

          // 计算该层节点位置
          const layerNodes = layer.nodes || [];
          const totalWidth = layerNodes.length * nodeWidth + (layerNodes.length - 1) * nodeSep;
          let startX = (this.stage.width() - totalWidth) / 2;

          layerNodes.forEach((node, nodeIndex) => {
            nodes.push({
              ...node,
              x: startX + nodeIndex * (nodeWidth + nodeSep),
              y: layerY,
              width: nodeWidth,
              height: nodeHeight,
              layerId: layer.id,
            });
          });

          layerY += nodeHeight + layerSep;
        });

        edgeList = this.config.edges || this.config.connections || [];
      } else {
        // 其他图表：使用 nodes 数组
        nodeList = this.config.nodes || [];
        edgeList = this.config.edges || this.config.connections ||
                   this.config.messages || this.config.transitions ||
                   this.config.relations || [];

        // 简单垂直布局
        nodeList.forEach((node, index) => {
          nodes.push({
            ...node,
            x: (this.stage.width() - 120) / 2,
            y: startY + index * (spacing.y + 60),
            width: 120,
            height: 40,
          });
        });
      }

      // 计算边的坐标
      edgeList.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (fromNode && toNode) {
          edges.push({
            ...edge,
            fromX: fromNode.x + fromNode.width / 2,
            fromY: fromNode.y + fromNode.height,
            toX: toNode.x + toNode.width / 2,
            toY: toNode.y,
          });
        }
      });

      return { nodes, edges, layerLabels };
    }

    /**
     * 渲染层级标签（架构图专用）
     */
    renderLayerLabels(layerLabels) {
      layerLabels.forEach(label => {
        const text = new Konva.Text({
          text: label.label,
          fontSize: 12,
          fontStyle: '500',
          fill: this.config.theme.text,
          opacity: 0.7,
          x: label.x,
          y: label.y,
        });
        this.mainLayer.add(text);
      });
    }

    renderNodes(nodes) {
      nodes.forEach(node => {
        const group = new Konva.Group({
          x: node.x,
          y: node.y,
        });
        group.setAttr('id', node.id);

        // 绘制节点形状
        const shape = this.createNodeShape(node);
        group.add(shape);

        // 绘制文本（支持多行）
        const label = node.label || '';
        const lines = label.split('\n');
        const lineHeight = 16;
        const textY = (node.height - lines.length * lineHeight) / 2;

        lines.forEach((line, index) => {
          const text = new Konva.Text({
            text: line,
            fontSize: this.config.fontSize.label,
            fill: '#ffffff',
            width: node.width,
            align: 'center',
            y: textY + index * lineHeight,
          });
          group.add(text);
        });

        // 存储 popover 数据
        if (node.popover) {
          group.setAttr('popover', node.popover);
        }

        this.mainLayer.add(group);
        this.nodes.set(node.id, group);
      });
    }

    createNodeShape(node) {
      const type = node.type || 'process';
      const fill = this.config.theme.node[type] || this.config.theme.node.primary;

      switch (type) {
        case 'terminal':
          return new Konva.Rect({
            width: node.width,
            height: node.height,
            fill: fill,
            cornerRadius: node.height / 2,
          });
        case 'decision':
          // 菱形效果
          return new Konva.Rect({
            width: node.width,
            height: node.height,
            fill: fill,
            cornerRadius: this.config.borderRadius,
          });
        default:
          return new Konva.Rect({
            width: node.width,
            height: node.height,
            fill: fill,
            cornerRadius: this.config.borderRadius,
            // 添加阴影效果
            shadowColor: 'rgba(0,0,0,0.1)',
            shadowBlur: 4,
            shadowOffset: { x: 0, y: 2 },
          });
      }
    }

    renderEdges(edges) {
      edges.forEach((edge) => {
        const line = new Konva.Arrow({
          points: [edge.fromX, edge.fromY, edge.toX, edge.toY],
          stroke: this.config.theme.edge.default,
          strokeWidth: 2,
          pointerLength: 10,
          pointerWidth: 10,
        });

        this.mainLayer.add(line);
        this.edges.push(line);

        // 渲染边标签
        if (edge.label) {
          const midX = (edge.fromX + edge.toX) / 2;
          const midY = (edge.fromY + edge.toY) / 2;

          const label = new Konva.Label({
            x: midX,
            y: midY,
          });

          label.add(new Konva.Tag({
            fill: this.config.theme.background,
            stroke: this.config.theme.edge.default,
            strokeWidth: 1,
            cornerRadius: 4,
          }));

          label.add(new Konva.Text({
            text: edge.label,
            fontSize: this.config.fontSize.edge,
            fill: this.config.theme.text,
            padding: 4,
          }));

          this.mainLayer.add(label);
        }
      });
    }

    applyInteractions() {
      // 启用缩放平移
      if (this.config.interactive?.zoomable !== false) {
        this.enableZoomPan();
      }

      // 启用 hover 高亮
      if (this.config.interactive?.hoverHighlight !== false) {
        this.enableHover();
      }

      // 启用点击弹出详情
      if (this.config.interactive?.clickPopover !== false) {
        this.enablePopover();
      }
    }

    enableZoomPan() {
      let scale = 1;
      const stage = this.stage;

      // 鼠标滚轮缩放
      stage.on('wheel', (e) => {
        e.evt.preventDefault();
        const oldScale = scale;
        const pointer = stage.getPointerPosition();

        scale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
        scale = Math.max(0.1, Math.min(5, scale));

        stage.scale({ x: scale, y: scale });
        stage.position({
          x: pointer.x - (pointer.x - stage.x()) * (scale / oldScale),
          y: pointer.y - (pointer.y - stage.y()) * (scale / oldScale),
        });
        stage.batchDraw();
      });

      // 拖拽平移
      stage.draggable(true);
    }

    enableHover() {
      this.nodes.forEach((group) => {
        group.on('mouseenter', () => {
          document.body.style.cursor = 'pointer';
          group.scale({ x: 1.05, y: 1.05 });
          this.mainLayer.batchDraw();
        });

        group.on('mouseleave', () => {
          document.body.style.cursor = 'default';
          group.scale({ x: 1, y: 1 });
          this.mainLayer.batchDraw();
        });
      });
    }

    enablePopover() {
      this.popoverEl = null;
      this.popoverCloseHandler = null;

      this.nodes.forEach((group) => {
        group.on('click', () => {
          const popover = group.getAttr('popover');
          if (!popover) return;

          // 移除已存在的 popover
          if (this.popoverEl) {
            this.popoverEl.remove();
            this.popoverEl = null;
          }
          if (this.popoverCloseHandler) {
            document.removeEventListener('click', this.popoverCloseHandler);
            this.popoverCloseHandler = null;
          }

          // 创建 popover 元素
          this.popoverEl = document.createElement('div');
          this.popoverEl.className = 'diagram-popover';
          this.popoverEl.innerHTML = `
            <div class="popover-title">${popover.title || group.getAttr('id')}</div>
            ${popover.description ? `<div class="popover-desc">${popover.description}</div>` : ''}
            ${popover.metadata ? `<div class="popover-meta">${Object.entries(popover.metadata).map(([k, v]) => `<span><b>${k}:</b> ${v}</span>`).join('')}</div>` : ''}
          `;

          // 定位
          this.popoverEl.style.position = 'absolute';
          this.popoverEl.style.left = `${group.x() + 100}px`;
          this.popoverEl.style.top = `${group.y() + 50}px`;

          this.container.appendChild(this.popoverEl);

          // 点击其他区域关闭
          setTimeout(() => {
            this.popoverCloseHandler = (e) => {
              if (this.popoverEl && !this.popoverEl.contains(e.target)) {
                this.popoverEl.remove();
                this.popoverEl = null;
                document.removeEventListener('click', this.popoverCloseHandler);
                this.popoverCloseHandler = null;
              }
            };
            document.addEventListener('click', this.popoverCloseHandler);
          }, 0);
        });
      });
    }

    fitToView() {
      // 自适应容器
      const clientRect = this.container.getBoundingClientRect();
      const stageRect = this.stage.getClientRect({ skipTransform: true });

      const scaleX = clientRect.width / (stageRect.width + this.config.padding * 2);
      const scaleY = clientRect.height / (stageRect.height + this.config.padding * 2);
      const scale = Math.min(scaleX, scaleY, 1);

      this.stage.scale({ x: scale, y: scale });
      this.stage.position({
        x: this.config.padding,
        y: this.config.padding,
      });

      this.stage.draw();
    }

    destroy() {
      if (this.popoverEl) {
        this.popoverEl.remove();
        this.popoverEl = null;
      }
      if (this.popoverCloseHandler) {
        document.removeEventListener('click', this.popoverCloseHandler);
        this.popoverCloseHandler = null;
      }
      if (this.stage) {
        this.stage.destroy();
      }
      this.nodes.clear();
      this.edges = [];
    }
  }

  // ============================================
  // index.js - 主入口
  // ============================================
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
        console.error('YGDiagram: Container not found');
        return null;
      }

      // 验证配置
      try {
        this.validateConfig(config);
      } catch (e) {
        console.error(e.message);
        return null;
      }

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
        console.warn(`YGDiagram: Unknown diagram type "${config.type}", using basic layout`);
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

  // ============================================
  // 导出到全局
  // ============================================
  global.YGDiagram = new YGDiagram();

})(typeof window !== 'undefined' ? window : this);