#!/bin/bash
# 验证技能执行前的上下文
# 检查 .yg-pm/ 目录是否存在
if [ ! -d ".yg-pm" ]; then
    echo "💡 提示：项目目录不存在，请先使用 /yg-new 创建项目"
fi