/**
 * yg-diagram 核心渲染器
 */

import { Stage, Layer, Text, Group, Rect, Arrow, Label, Tag } from 'konva/lib/Core.js';

export class DiagramCore {
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

    // 创建 Konva Stage
    this.stage = new Stage({
      container: this.container,
      width,
      height,
    });

    // 创建标题图层
    this.titleLayer = new Layer();
    this.stage.add(this.titleLayer);

    // 创建主图层
    this.mainLayer = new Layer();
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
      const title = new Text({
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
    const layout = this.getLayout();

    // 1. 计算布局
    const positions = layout.calculate(this.config);

    // 2. 渲染连线（先于节点，避免遮挡）
    this.renderEdges(positions.edges);

    // 3. 渲染节点
    this.renderNodes(positions.nodes);

    // 4. 应用交互
    this.applyInteractions();

    // 5. 自适应视图
    this.fitToView();
  }

  getLayout() {
    // 布局工厂 - 根据图表类型返回对应布局
    // 实际实现中会动态加载，这里返回基础布局
    return {
      calculate: (config) => this.basicLayout(config),
    };
  }

  basicLayout(config) {
    // 基础布局算法
    const nodes = [];
    const edges = [];
    const nodeSpacing = this.config.nodeSpacing;

    // 获取所有节点
    const nodeList = config.nodes || [];
    const edgeList = config.edges || config.connections || config.messages || config.transitions || config.relations || [];

    // 计算起始 Y 偏移（为标题留空间）
    const startY = this.config.title ? 50 : 20;

    // 简单垂直布局
    nodeList.forEach((node, index) => {
      nodes.push({
        ...node,
        x: 200,
        y: startY + index * (nodeSpacing.y + 60),
        width: 120,
        height: 40,
      });
    });

    // 边数据
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

    return { nodes, edges };
  }

  renderNodes(nodes) {
    nodes.forEach(node => {
      const group = new Group({
        x: node.x,
        y: node.y,
      });
      // Store id as attribute for popover access
      group.setAttr('id', node.id);

      // 绘制节点形状
      const shape = this.createNodeShape(node);
      group.add(shape);

      // 绘制文本
      const text = new Text({
        text: node.label,
        fontSize: this.config.fontSize.label,
        fill: this.config.theme.text,
        width: node.width,
        align: 'center',
        verticalAlign: 'middle',
        height: node.height,
      });
      group.add(text);

      // 存储 popover 数据
      if (node.popover) {
        group.setAttr('popover', node.popover);
      }

      this.mainLayer.add(group);
      this.nodes.set(node.id, group);
    });
  }

  createNodeShape(node) {
    const fill = this.config.theme.node[node.type] || this.config.theme.node.neutral;

    switch (node.type) {
      case 'terminal':
        return new Rect({
          width: node.width,
          height: node.height,
          fill,
          cornerRadius: node.height / 2,
        });
      case 'decision':
        return new Rect({
          width: node.width,
          height: node.height,
          fill,
          cornerRadius: this.config.borderRadius,
          // 菱形效果通过 CSS 或自定义绘制实现
        });
      default:
        return new Rect({
          width: node.width,
          height: node.height,
          fill,
          cornerRadius: this.config.borderRadius,
        });
    }
  }

  renderEdges(edges) {
    edges.forEach((edge) => {
      const line = new Arrow({
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

        const label = new Label({
          x: midX,
          y: midY,
        });

        label.add(new Tag({
          fill: this.config.theme.background,
          stroke: this.config.theme.edge.default,
          strokeWidth: 1,
          cornerRadius: 4,
        }));

        label.add(new Text({
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
        const rect = this.container.getBoundingClientRect();
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
    // Clean up popover DOM element
    if (this.popoverEl) {
      this.popoverEl.remove();
      this.popoverEl = null;
    }
    // Remove document click listener
    if (this.popoverCloseHandler) {
      document.removeEventListener('click', this.popoverCloseHandler);
      this.popoverCloseHandler = null;
    }
    // Konva stage.destroy() cleans up all Konva event listeners
    if (this.stage) {
      this.stage.destroy();
    }
    this.nodes.clear();
    this.edges = [];
  }
}