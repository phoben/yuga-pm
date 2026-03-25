/**
 * 架构图布局算法
 * 分层水平布局
 */

export class ArchitectureLayout {
  constructor() {
    this.nodeWidth = 120;
    this.nodeHeight = 50;
    this.layerSep = 100;
    this.nodeSep = 30;
  }

  calculate(config) {
    const layers = config.layers || [];
    const nodes = [];
    const edges = [];
    const connections = config.connections || [];
    const nodeMap = new Map();

    // 分层布局：每层水平排列
    let yOffset = 0;
    layers.forEach((layer, layerIndex) => {
      const layerNodes = layer.nodes || [];
      const layerWidth = layerNodes.length * (this.nodeWidth + this.nodeSep) - this.nodeSep;
      const startX = -layerWidth / 2;

      layerNodes.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * (this.nodeWidth + this.nodeSep);
        const position = {
          ...node,
          x,
          y: yOffset,
          width: this.nodeWidth,
          height: this.nodeHeight,
          layerId: layer.id,
        };
        nodes.push(position);
        nodeMap.set(node.id, position);
      });

      yOffset += this.layerSep + this.nodeHeight;
    });

    // 处理连接
    connections.forEach(conn => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      if (fromNode && toNode) {
        edges.push({
          ...conn,
          fromX: fromNode.x + fromNode.width / 2,
          fromY: fromNode.y + fromNode.height,
          toX: toNode.x + toNode.width / 2,
          toY: toNode.y,
        });
      }
    });

    return { nodes, edges };
  }
}