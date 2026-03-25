/**
 * 时序图布局算法
 * 参与者水平排列，消息垂直排列
 */

export class SequenceLayout {
  constructor() {
    this.participantWidth = 100;
    this.participantHeight = 40;
    this.messageSpacing = 40;
    this.participantSep = 150;
  }

  calculate(config) {
    const participants = config.participants || [];
    const messages = config.messages || [];
    const nodes = [];
    const edges = [];
    const participantPositions = {};

    // 参与者水平排列
    const startX = 50;
    participants.forEach((p, i) => {
      const x = startX + i * this.participantSep;
      participantPositions[p.id] = x;
      nodes.push({
        ...p,
        x,
        y: 20,
        width: this.participantWidth,
        height: this.participantHeight,
      });
    });

    // 消息垂直排列
    let messageY = 80;
    messages.forEach(msg => {
      const fromX = participantPositions[msg.from];
      const toX = participantPositions[msg.to];
      if (fromX !== undefined && toX !== undefined) {
        edges.push({
          ...msg,
          fromX,
          toX,
          fromY: messageY,
          toY: messageY,
        });
        messageY += this.messageSpacing;
      }
    });

    return { nodes, edges };
  }
}