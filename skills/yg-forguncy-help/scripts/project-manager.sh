#!/bin/bash
# YG-PM 项目管理工具脚本

YG_PM_DIR=".yg-pm"
PROJECTS_DIR="$YG_PM_DIR/projects"
ARCHIVE_DIR="$YG_PM_DIR/archive"

# 创建项目
create_project() {
    local name="$1"
    local project_dir="$PROJECTS_DIR/$name"

    if [ -d "$project_dir" ]; then
        echo "❌ 项目已存在: $name"
        return 1
    fi

    mkdir -p "$project_dir"/{drafts,documents,prototypes}

    local id=$(echo "$name" | head -c 3 | tr '[:lower:]' '[:upper:]')-$(date +%Y)-001
    local date=$(date +%Y-%m-%d)

    cat > "$project_dir/project.json" << EOF
{
  "id": "$id",
  "name": "$name",
  "description": "",
  "stage": "draft",
  "created_at": "$date",
  "updated_at": "$date",
  "documents": [],
  "tags": []
}
EOF

    echo "✅ 项目创建成功: $name"
}

# 列出项目
list_projects() {
    echo "📋 进行中的项目:"
    for dir in "$PROJECTS_DIR"/*/; do
        if [ -d "$dir" ]; then
            local name=$(basename "$dir")
            local stage=$(cat "$dir/project.json" 2>/dev/null | grep -o '"stage"[^,]*' | cut -d'"' -f4)
            echo "  - $name [$stage]"
        fi
    done
}

case "$1" in
    create) create_project "$2" ;;
    list) list_projects ;;
    *) echo "用法: $0 {create|list} [name]" ;;
esac