/**
 * 流程图布局算法
 * 使用拓扑排序进行层次布局
 */

export class FlowchartLayout {
  constructor() {
    this.nodeWidth = 120;
    this.nodeHeight = 40;
    this.rankSep = 80;  // 层间距
    this.nodeSep = 60;  // 节点间距
  }

  calculate(config) {
    const nodes = config.nodes || [];
    const edges = config.edges || [];

    // 使用简单的层次布局算法
    const layers = this.assignLayers(nodes, edges);
    const positions = this.positionNodes(layers, edges);

    return {
      nodes: positions.nodes,
      edges: positions.edges,
    };
  }

  /**
   * 分配节点到各层
   */
  assignLayers(nodes, edges) {
    const layers = [];
    const nodeLayers = new Map();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // 计算入度
    const inDegree = new Map();
    nodes.forEach(n => inDegree.set(n.id, 0));
    edges.forEach(e => {
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
    });

    // 拓扑排序
    let remaining = [...nodes];
    while (remaining.length > 0) {
      // 当前层：入度为 0 的节点
      const currentLayer = remaining.filter(n => inDegree.get(n.id) === 0);

      if (currentLayer.length === 0) {
        // 存在环，取剩余节点
        layers.push(remaining);
        break;
      }

      layers.push(currentLayer);

      // 移除当前层节点，更新入度
      currentLayer.forEach(n => {
        edges.filter(e => e.from === n.id).forEach(e => {
          inDegree.set(e.to, inDegree.get(e.to) - 1);
        });
      });

      remaining = remaining.filter(n => !currentLayer.includes(n));
    }

    return layers;
  }

  /**
   * 计算节点位置
   */
  positionNodes(layers, edges) {
    const nodes = [];
    const nodePositions = new Map();
    const layerHeight = this.nodeHeight + this.rankSep;

    layers.forEach((layer, layerIndex) => {
      const layerWidth = layer.length * (this.nodeWidth + this.nodeSep) - this.nodeSep;
      const startX = -layerWidth / 2;

      layer.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * (this.nodeWidth + this.nodeSep);
        const y = layerIndex * layerHeight;

        const position = {
          ...node,
          x,
          y,
          width: this.nodeWidth,
          height: this.nodeHeight,
        };

        nodes.push(position);
        nodePositions.set(node.id, position);
      });
    });

    // 计算边位置
    const edgePositions = edges.map(edge => {
      const from = nodePositions.get(edge.from);
      const to = nodePositions.get(edge.to);

      if (!from || !to) return null;

      return {
        ...edge,
        fromX: from.x + from.width / 2,
        fromY: from.y + from.height,
        toX: to.x + to.width / 2,
        toY: to.y,
      };
    }).filter(Boolean);

    return { nodes, edges: edgePositions };
  }
}