/**
 * 状态图布局算法
 * 基础框架 - 后续迭代完善
 */

export class StatechartLayout {
  constructor() {
    this.nodeWidth = 120;
    this.nodeHeight = 40;
    this.nodeSep = 80;
  }

  calculate(config) {
    const states = config.states || [];
    const transitions = config.transitions || [];
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // 简单网格布局
    states.forEach((state, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const position = {
        ...state,
        x: col * (this.nodeWidth + this.nodeSep),
        y: row * (this.nodeHeight + this.nodeSep),
        width: this.nodeWidth,
        height: state.type === 'initial' || state.type === 'final' ? 30 : this.nodeHeight,
      };
      nodes.push(position);
      nodeMap.set(state.id, position);
    });

    // 处理转换
    transitions.forEach(trans => {
      const from = nodeMap.get(trans.from);
      const to = nodeMap.get(trans.to);
      if (from && to) {
        edges.push({
          ...trans,
          fromX: from.x + from.width / 2,
          fromY: from.y + from.height,
          toX: to.x + to.width / 2,
          toY: to.y,
        });
      }
    });

    return { nodes, edges };
  }
}