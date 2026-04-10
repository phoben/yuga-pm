#!/bin/bash
#
# pre-push hook: 检测版本号是否递增
# 如果版本号未递增，自动更新 patch 版本后推送
#

set -e

# Windows Git Bash 需要禁用路径转换
export MSYS_NO_PATHCONV=1

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)

# 只在 master 分支推送时检查
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "ℹ️  非 master 分支推送，跳过版本检查"
    exit 0
fi

# 获取远程分支的最新版本号
echo "🔍 正在检查远程版本号..."
git fetch origin master --quiet 2>/dev/null || true

# 使用 cat-file 获取远程文件内容（兼容 Windows）
REMOTE_CONTENT=$(git cat-file -p "origin/master:.claude-plugin/plugin.json" 2>/dev/null || echo "")
REMOTE_VERSION=$(echo "$REMOTE_CONTENT" | grep '"version"' | head -1 | grep -o '"[0-9]\+\.[0-9]\+\.[0-9]\+"' | tr -d '"')

# 如果远程分支不存在或文件不存在，直接推送
if [ -z "$REMOTE_VERSION" ]; then
    echo "ℹ️  远程版本信息不存在，直接推送"
    exit 0
fi

# 获取本地版本号
LOCAL_VERSION=$(grep '"version"' .claude-plugin/plugin.json | head -1 | grep -o '"[0-9]\+\.[0-9]\+\.[0-9]\+"' | tr -d '"')

echo "   远程版本: $REMOTE_VERSION"
echo "   本地版本: $LOCAL_VERSION"

# 比较版本号
if [ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]; then
    echo "✅ 版本号已更新 ($REMOTE_VERSION → $LOCAL_VERSION)，继续推送"
    exit 0
fi

# 版本号相同，需要自动递增
echo "⚠️  版本号未递增，自动更新中..."

# 解析版本号 (major.minor.patch)
MAJOR=$(echo "$LOCAL_VERSION" | cut -d. -f1)
MINOR=$(echo "$LOCAL_VERSION" | cut -d. -f2)
PATCH=$(echo "$LOCAL_VERSION" | cut -d. -f3)

# 递增 patch 版本
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "   新版本号: $NEW_VERSION"

# 更新 plugin.json
if [ -f ".claude-plugin/plugin.json" ]; then
    sed -i "s/\"version\": \"$LOCAL_VERSION\"/\"version\": \"$NEW_VERSION\"/" .claude-plugin/plugin.json
    echo "   ✅ 已更新 .claude-plugin/plugin.json"
fi

# 更新 marketplace.json
if [ -f ".claude-plugin/marketplace.json" ]; then
    sed -i "s/\"version\": \"$LOCAL_VERSION\"/\"version\": \"$NEW_VERSION\"/" .claude-plugin/marketplace.json
    echo "   ✅ 已更新 .claude-plugin/marketplace.json"
fi

# 添加到暂存区并提交
git add .claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "chore: bump version to $NEW_VERSION"

echo "✅ 版本号已自动递增至 $NEW_VERSION，继续推送"
exit 0