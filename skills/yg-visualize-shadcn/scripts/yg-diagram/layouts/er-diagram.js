/**
 * ER 图布局算法
 * 基础框架 - 后续迭代完善
 */

export class ERDiagramLayout {
  constructor() {
    this.entityWidth = 160;
    this.entityHeight = 100;
    this.nodeSep = 80;
  }

  calculate(config) {
    const entities = config.entities || [];
    const relations = config.relations || [];
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // 网格布局
    entities.forEach((entity, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const position = {
        ...entity,
        x: col * (this.entityWidth + this.nodeSep),
        y: row * (this.entityHeight + this.nodeSep),
        width: this.entityWidth,
        height: this.entityHeight,
      };
      nodes.push(position);
      nodeMap.set(entity.id, position);
    });

    // 处理关系
    relations.forEach(rel => {
      const from = nodeMap.get(rel.from);
      const to = nodeMap.get(rel.to);
      if (from && to) {
        edges.push({
          ...rel,
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