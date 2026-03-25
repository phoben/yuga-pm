/**
 * 甘特图布局算法
 * 基础框架 - 后续迭代完善
 */

export class GanttLayout {
  constructor() {
    this.rowHeight = 30;
    this.leftMargin = 150;
  }

  calculate(config) {
    const groups = config.groups || [];
    const nodes = [];
    const edges = [];

    // TODO: 实现完整甘特图布局
    let y = 0;
    groups.forEach(group => {
      const tasks = group.tasks || [];
      tasks.forEach(task => {
        nodes.push({
          ...task,
          x: this.leftMargin,
          y: y * this.rowHeight,
          width: 200,
          height: this.rowHeight - 4,
        });
        y++;
      });
    });

    return { nodes, edges };
  }
}