#!/bin/bash
# 自动格式化文档
# 如果有 prettier 可用则使用
if command -v prettier &> /dev/null; then
    # 格式化 markdown 文件
    if [[ "$CLAUDE_TOOL_INPUT" == *".md"* ]]; then
        echo "📝 自动格式化文档..."
    fi
fi