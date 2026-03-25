/**
 * yg-diagram 默认配置
 */

export const DEFAULT_CONFIG = {
  padding: 40,
  nodeSpacing: { x: 80, y: 60 },
  fontSize: { title: 16, label: 14, edge: 12 },
  borderRadius: 8,
};

export const THEMES = {
  light: {
    background: '#ffffff',
    text: '#1e293b',
    node: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
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

export const DIAGRAM_TYPES = [
  'flowchart',
  'architecture',
  'sequence',
  'statechart',
  'er-diagram',
  'gantt',
  'mindmap',
  'network',
];