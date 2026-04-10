#!/bin/bash
#
# PreToolUse hook: git push 前检查版本号
# 匹配模式: Bash.*git push
#
# 功能：
# 1. 检测是否推送 master 分支
# 2. 比较远程与本地版本号
# 3. 如果版本相同，自动递增并提交
#

set -e

# Windows Git Bash 需要禁用路径转换
export MSYS_NO_PATHCONV=1

# 获取工具调用参数（环境变量或 stdin）
# Claude Code PreToolUse hook 会通过 stdin 传入工具调用信息
INPUT=$(cat)

# 检查是否包含 git push 命令
if ! echo "$INPUT" | grep -q "git push"; then
    exit 0
fi

# 检查是否推送 master 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "ℹ️  [Hook] 非 master 分支推送，跳过版本检查"
    exit 0
fi

# 检查是否推送 origin
if ! echo "$INPUT" | grep -q "origin"; then
    exit 0
fi

echo "🔍 [Hook] 正在检查版本号..."

# 获取远程版本
git fetch origin master --quiet 2>/dev/null || true
REMOTE_CONTENT=$(git cat-file -p "origin/master:.claude-plugin/plugin.json" 2>/dev/null || echo "")
REMOTE_VERSION=$(echo "$REMOTE_CONTENT" | grep '"version"' | head -1 | grep -o '"[0-9]\+\.[0-9]\+\.[0-9]\+"' | tr -d '"')

if [ -z "$REMOTE_VERSION" ]; then
    echo "ℹ️  [Hook] 远程版本信息不存在，跳过检查"
    exit 0
fi

# 获取本地版本
LOCAL_VERSION=$(grep '"version"' .claude-plugin/plugin.json | head -1 | grep -o '"[0-9]\+\.[0-9]\+\.[0-9]\+"' | tr -d '"')

echo "   远程版本: $REMOTE_VERSION"
echo "   本地版本: $LOCAL_VERSION"

# 版本已更新，继续推送
if [ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]; then
    echo "✅ [Hook] 版本号已更新 ($REMOTE_VERSION → $LOCAL_VERSION)"
    exit 0
fi

# 版本相同，自动递增
echo "⚠️  [Hook] 版本号未递增，自动更新..."

MAJOR=$(echo "$LOCAL_VERSION" | cut -d. -f1)
MINOR=$(echo "$LOCAL_VERSION" | cut -d. -f2)
PATCH=$(echo "$LOCAL_VERSION" | cut -d. -f3)
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "   新版本号: $NEW_VERSION"

# 更新文件
sed -i "s/\"version\": \"$LOCAL_VERSION\"/\"version\": \"$NEW_VERSION\"/" .claude-plugin/plugin.json
sed -i "s/\"version\": \"$LOCAL_VERSION\"/\"version\": \"$NEW_VERSION\"/" .claude-plugin/marketplace.json

echo "   ✅ 已更新版本文件"

# 提交更改
git add .claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "chore: bump version to $NEW_VERSION"

echo "✅ [Hook] 版本号已自动递增至 $NEW_VERSION"
exit 0