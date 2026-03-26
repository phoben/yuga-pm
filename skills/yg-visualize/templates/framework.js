/**
 * Framework JavaScript for yg-visualize template
 * Extracted from framework.html
 */

// Initialize Lucide icons
lucide.createIcons();

/* ============================================
   Canvas Helper - Canvas 绘制工具库
   ============================================ */
window.CanvasHelper = {
  // 预定义颜色方案（与 shadcn/ui 一致）
  colorSchemes: {
    light: {
      foreground: '#0f172a',
      primary: '#3b82f6',
      primaryDark: '#2563eb',
      secondary: '#8b5cf6',
      secondaryDark: '#7c3aed',
      tertiary: '#10b981',
      tertiaryDark: '#059669',
      muted: '#64748b',
      border: '#e2e8f0',
      background: '#ffffff'
    },
    dark: {
      foreground: '#f8fafc',
      primary: '#60a5fa',
      primaryDark: '#3b82f6',
      secondary: '#a78bfa',
      secondaryDark: '#8b5cf6',
      tertiary: '#34d399',
      tertiaryDark: '#10b981',
      muted: '#94a3b8',
      border: '#334155',
      background: '#0f172a'
    }
  },

  // 标准字体栈（支持中英文）
  fontStack: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',

  // 获取当前主题的颜色方案
  getColors() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return this.colorSchemes[theme];
  },

  // 设置 Canvas（Retina 适配）
  setupCanvas(canvas, width, height) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    return ctx;
  },

  // 绘制圆角矩形
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
    }
    ctx.closePath();
  },

  // 节点类型颜色映射
  nodeColors: {
    primary: (c) => ({ fill: c.primary, stroke: c.primaryDark, text: '#ffffff' }),
    secondary: (c) => ({ fill: c.secondary, stroke: c.secondaryDark, text: '#ffffff' }),
    tertiary: (c) => ({ fill: c.tertiary, stroke: c.tertiaryDark, text: '#ffffff' })
  },

  // 绘制节点
  drawNode(ctx, node) {
    const colors = this.getColors();
    const colorFn = this.nodeColors[node.type] || this.nodeColors.primary;
    const color = colorFn(colors);

    this.drawRoundedRect(ctx, node.x, node.y, node.width, node.height, 8);

    ctx.fillStyle = color.fill;
    ctx.fill();
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = color.text;
    ctx.font = `500 14px ${this.fontStack}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2);
  },

  // 绘制连接线
  drawConnection(ctx, from, to, label) {
    const colors = this.getColors();
    const startX = from.x + from.width / 2;
    const startY = from.y + from.height;
    const endX = to.x + to.width / 2;
    const endY = to.y;

    // 绘制线条
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = colors.muted;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制箭头
    const arrowSize = 8;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - arrowSize, endY - arrowSize);
    ctx.lineTo(endX + arrowSize, endY - arrowSize);
    ctx.closePath();
    ctx.fillStyle = colors.muted;
    ctx.fill();

    // 绘制标签
    if (label) {
      ctx.fillStyle = colors.muted;
      ctx.font = `12px ${this.fontStack}`;
      ctx.fillText(label, (startX + endX) / 2, (startY + endY) / 2 - 10);
    }
  },

  // 计算内容边界
  calculateBounds(nodes, connections) {
    let maxX = 0, maxY = 0;
    const padding = 60;

    nodes.forEach(node => {
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    // 考虑连接线标签
    if (connections) {
      connections.forEach(conn => {
        if (conn.label) {
          const from = nodes.find(n => n.id === conn.from);
          const to = nodes.find(n => n.id === conn.to);
          if (from && to) {
            maxX = Math.max(maxX, (from.x + to.x + to.width) / 2 + 30);
          }
        }
      });
    }

    return {
      width: Math.max(400, maxX + padding),
      height: Math.max(200, maxY + padding)
    };
  }
};

/* ============================================
   Theme Management
   ============================================ */
const THEME_KEY = 'yg-visualize-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// Initialize theme
(function initTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    setTheme(storedTheme);
  } else {
    setTheme(getSystemTheme());
  }
})();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!getStoredTheme()) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});

/* ============================================
   Navigation Sync with IntersectionObserver
   ============================================ */
const sections = document.querySelectorAll('section[data-region="true"]');
const navItems = document.querySelectorAll('.nav-item');

const observerOptions = {
  root: null,
  rootMargin: '-20% 0px -70% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(item => {
        if (item.getAttribute('data-pending') === 'false') {
          const isActive = item.getAttribute('href') === '#' + entry.target.id;
          item.classList.toggle('active', isActive);
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// Smooth scroll for navigation (only for enabled items)
document.querySelectorAll('.nav-item[data-pending="false"]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = item.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ============================================
   Accordion Interaction
   ============================================ */
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', function() {
    const item = this.closest('.accordion-item');
    const isOpen = item.getAttribute('data-state') === 'open';

    // Toggle state
    item.setAttribute('data-state', isOpen ? 'closed' : 'open');
  });
});

/* ============================================
   Toggle All Accordions
   ============================================ */
let allAccordionsExpanded = false;

function toggleAllAccordions() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  const expandIcon = document.querySelector('.accordion-icon-expand');
  const collapseIcon = document.querySelector('.accordion-icon-collapse');

  allAccordionsExpanded = !allAccordionsExpanded;

  accordionItems.forEach(item => {
    item.setAttribute('data-state', allAccordionsExpanded ? 'open' : 'closed');
  });

  // 切换图标显示：展开状态显示eye-off，折叠状态显示eye
  if (allAccordionsExpanded) {
    expandIcon.classList.add('hidden');
    collapseIcon.classList.remove('hidden');
  } else {
    expandIcon.classList.remove('hidden');
    collapseIcon.classList.add('hidden');
  }
}

/* ============================================
   PDF Export Functionality
   ============================================ */
async function exportPDF() {
  const btn = document.getElementById('export-pdf-btn');
  const printerIcon = btn.querySelector('.export-icon-printer');
  const loaderIcon = btn.querySelector('.export-icon-loader');

  // 显示加载状态
  printerIcon.classList.add('hidden');
  loaderIcon.classList.remove('hidden');
  btn.disabled = true;

  // 页脚内容（与pdf-cover-footer相同）
  const footerText = document.querySelector('.pdf-cover-footer')?.textContent?.trim() || '云之初信息科技有限公司';

  // 保存accordion原始状态
  const accordionItems = document.querySelectorAll('.accordion-item');
  const originalStates = [];
  accordionItems.forEach((item, i) => {
    originalStates[i] = item.getAttribute('data-state');
    item.setAttribute('data-state', 'open');
  });

  try {
    // 切换到PDF导出模式
    document.body.classList.add('pdf-export-mode');

    // 等待样式应用
    await new Promise(resolve => setTimeout(resolve, 100));

    // PDF配置
    const element = document.body;
    const opt = {
      margin: [15, 15, 20, 15], // 上右下左，留出页脚空间
      filename: getPDFFileName(),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        after: '.pdf-cover, .pdf-toc'
      }
    };

    // 生成PDF并添加页脚
    const pdf = await html2pdf().set(opt).from(element).toPdf().get('pdf');

    // 添加页脚
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      // 跳过封面页（第1页）和目录页（第2页）
      if (i > 2) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139); // muted-foreground颜色

        // 页脚左侧：公司名称
        pdf.text(footerText, 15, pdf.internal.pageSize.getHeight() - 10);

        // 页脚右侧：页码
        const pageNum = i - 2; // 从正文开始计数
        pdf.text(String(pageNum), pdf.internal.pageSize.getWidth() - 15, pdf.internal.pageSize.getHeight() - 10, { align: 'right' });
      }
    }

    // 保存PDF
    pdf.save(getPDFFileName());

  } catch (error) {
    console.error('PDF导出失败:', error);
    alert('PDF导出失败，请重试');
  } finally {
    // 恢复accordion原始状态
    accordionItems.forEach((item, i) => {
      item.setAttribute('data-state', originalStates[i]);
    });
    // 恢复页面状态
    document.body.classList.remove('pdf-export-mode');
    printerIcon.classList.remove('hidden');
    loaderIcon.classList.add('hidden');
    btn.disabled = false;
  }
}

function getPDFFileName() {
  // 从文档标题生成文件名
  const title = document.querySelector('[data-fill="header-title"]')?.textContent || 'document';
  const date = new Date().toISOString().split('T')[0];
  return `${title}_${date}.pdf`;
}

/* ============================================
   Mobile Sidebar Toggle
   ============================================ */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar && overlay) {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }
}

// 绑定汉堡按钮点击事件
document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar);

// 点击遮罩层关闭侧边栏
document.getElementById('sidebar-overlay')?.addEventListener('click', toggleSidebar);

// 点击导航项后自动关闭侧边栏（移动端）
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar?.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay?.classList.remove('open');
      }
    }
  });
});