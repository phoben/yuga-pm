/**
 * 网络拓扑图布局算法
 * 使用节点提供的坐标或自动布局
 */

export class NetworkLayout {
  constructor() {
    this.nodeWidth = 80;
    this.nodeHeight = 60;
  }

  calculate(config) {
    const networkNodes = config.nodes || [];
    const connections = config.connections || [];
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // 使用节点提供的坐标或自动网格布局
    networkNodes.forEach((node, index) => {
      const position = {
        ...node,
        x: node.x !== undefined ? node.x : (index % 4) * 150,
        y: node.y !== undefined ? node.y : Math.floor(index / 4) * 100,
        width: this.nodeWidth,
        height: this.nodeHeight,
      };
      nodes.push(position);
      nodeMap.set(node.id, position);
    });

    // 处理连接
    connections.forEach(conn => {
      const from = nodeMap.get(conn.from);
      const to = nodeMap.get(conn.to);
      if (from && to) {
        edges.push({
          ...conn,
          fromX: from.x + from.width / 2,
          fromY: from.y + from.height / 2,
          toX: to.x + to.width / 2,
          toY: to.y + to.height / 2,
        });
      }
    });

    return { nodes, edges };
  }
}