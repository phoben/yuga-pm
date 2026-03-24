#!/bin/bash
# extract-outline.sh - 提取 Markdown 文档层级结构
# 输入: Markdown 文件路径
# 输出: JSON 格式的文档结构

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <markdown_file>" >&2
    exit 1
fi

MD_FILE="$1"

if [ ! -f "$MD_FILE" ]; then
    echo "Error: File not found: $MD_FILE" >&2
    exit 1
fi

# 获取文件总字符数
CHAR_COUNT=$(wc -c < "$MD_FILE" | tr -d ' ')

# 获取文件总行数
LINE_COUNT=$(wc -l < "$MD_FILE" | tr -d ' ')

# 计算建议分块数 (基于设计规格: >= 3万字符时，每增加1万增加1个SubAgent)
calculate_chunks() {
    local chars=$1
    if [ "$chars" -lt 30000 ]; then
        echo 0
    else
        echo $(( (chars - 20000) / 10000 + 1 ))
    fi
}

SUGGESTED_CHUNKS=$(calculate_chunks "$CHAR_COUNT")

# 主处理逻辑：提取标题并构建层级结构
# 使用 awk 处理整个文件
awk -v char_count="$CHAR_COUNT" -v line_count="$LINE_COUNT" -v suggested_chunks="$SUGGESTED_CHUNKS" '
BEGIN {
    current_char = 0
    heading_count = 0
}

{
    line = $0
    line_len = length(line)

    # 检测标题行 (H1-H3)
    if (match(line, /^#{1,3}[ \t]+/)) {
        # 计算标题级别
        match(line, /^#+/)
        level = RLENGTH

        # 提取标题文本 (去除 # 符号)
        text = substr(line, level + 2)
        gsub(/^[ \t]+|[ \t]+$/, "", text)

        if (level >= 1 && level <= 3 && text != "") {
            heading_count++

            # 记录当前标题信息
            headings[heading_count, "level"] = level
            headings[heading_count, "text"] = text
            headings[heading_count, "startLine"] = NR
            headings[heading_count, "startChar"] = current_char

            # 更新前一个标题的结束位置
            if (heading_count > 1) {
                headings[heading_count - 1, "endLine"] = NR - 1
                headings[heading_count - 1, "endChar"] = current_char - 1
            }
        }
    }

    # 更新字符位置 (包括换行符)
    current_char += line_len + 1
}

END {
    # 设置最后一个标题的结束位置
    if (heading_count > 0) {
        headings[heading_count, "endLine"] = line_count
        headings[heading_count, "endChar"] = char_count - 1
    }

    # 输出 JSON
    printf "{\n"
    printf "  \"charCount\": %d,\n", char_count
    printf "  \"lineCount\": %d,\n", line_count
    printf "  \"suggestedChunks\": %d,\n", suggested_chunks
    printf "  \"headings\": [\n"

    for (i = 1; i <= heading_count; i++) {
        # 生成ID (只保留字母、数字、中文，其他转为-)
        id = headings[i, "text"]

        # 替换特殊字符为连字符
        gsub(/[^a-zA-Z0-9]/, "-", id)
        # 合并多个连字符
        gsub(/--*/, "-", id)
        # 去除首尾连字符
        gsub(/^-/, "", id)
        gsub(/-$/, "", id)

        if (id == "") id = "section-" i

        printf "    {\n"
        printf "      \"level\": %d,\n", headings[i, "level"]
        printf "      \"text\": \"%s\",\n", headings[i, "text"]
        printf "      \"id\": \"%s\",\n", id
        printf "      \"startLine\": %d,\n", headings[i, "startLine"]
        printf "      \"endLine\": %d,\n", headings[i, "endLine"]
        printf "      \"charRange\": [%d, %d],\n", headings[i, "startChar"], headings[i, "endChar"]
        printf "      \"children\": []\n"
        printf "    }%s\n", (i < heading_count ? "," : "")
    }

    printf "  ]\n"
    printf "}\n"
}
' "$MD_FILE"