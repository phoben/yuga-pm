/**
 * 思维导图布局算法
 * 基础框架 - 后续迭代完善
 */

export class MindmapLayout {
  constructor() {
    this.nodeWidth = 100;
    this.nodeHeight = 30;
    this.levelSep = 150;
    this.nodeSep = 20;
  }

  calculate(config) {
    const root = config.root;
    const nodes = [];
    const edges = [];

    if (!root) return { nodes, edges };

    // 递归布局
    this.layoutNode(root, 0, 0, nodes, edges);

    return { nodes, edges };
  }

  layoutNode(node, level, yOffset, nodes, edges) {
    const x = level * this.levelSep;
    const position = {
      ...node,
      x,
      y: yOffset,
      width: this.nodeWidth,
      height: this.nodeHeight,
    };
    nodes.push(position);

    if (node.children) {
      let childY = yOffset;
      node.children.forEach(child => {
        this.layoutNode(child, level + 1, childY, nodes, edges);
        edges.push({
          from: node.id,
          to: child.id,
          fromX: x + this.nodeWidth,
          fromY: yOffset + this.nodeHeight / 2,
          toX: (level + 1) * this.levelSep,
          toY: childY + this.nodeHeight / 2,
        });
        childY += this.nodeHeight + this.nodeSep;
      });
    }
  }
}