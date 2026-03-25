#!/usr/bin/env python3
"""
extract-outline.py - 提取 Markdown 文档层级结构

输入: Markdown 文件路径
输出: JSON 格式的文档结构

输出结构:
  - title: 文档标题 (H1)
  - meta: H1 后到第一个 H2 之间的元信息区域行号
  - sections: H2 章节列表
"""

import json
import re
import sys
from pathlib import Path

# 修复 Windows 控制台 UTF-8 编码问题
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


def extract_outline(md_file: str) -> dict:
    """提取 Markdown 文档的层级结构"""

    path = Path(md_file)
    if not path.exists():
        print(f"Error: File not found: {md_file}", file=sys.stderr)
        sys.exit(1)

    content = path.read_text(encoding="utf-8")
    lines = content.splitlines()

    title = ""
    meta = {"startLine": None, "endLine": None}
    sections = []
    first_h2_line = None

    for i, line in enumerate(lines, start=1):
        # 检测 H1 标题
        h1_match = re.match(r'^#\s+(.+)$', line)
        if h1_match and not title:
            title = h1_match.group(1).strip()
            # 元信息区域从 H1 下一行开始
            meta["startLine"] = i + 1
            continue

        # 检测 H2 标题
        h2_match = re.match(r'^##\s+(.+)$', line)
        if h2_match:
            text = h2_match.group(1).strip()

            # 记录第一个 H2 的行号
            if first_h2_line is None:
                first_h2_line = i
                # 元信息区域结束于第一个 H2 之前
                meta["endLine"] = i - 1

            # 使用递增序号作为 ID，确保唯一且有序
            section_index = len(sections) + 1
            id_str = f"section-{section_index}"

            sections.append({
                "id": id_str,
                "text": text,
                "startLine": i,
                "endLine": len(lines),  # 先设为最后一行，后续更新
                "children": []
            })

        # 检测 H3 标题 (作为当前 H2 的子章节)
        h3_match = re.match(r'^###\s+(.+)$', line)
        if h3_match and sections:
            text = h3_match.group(1).strip()
            # 使用父章节 ID + 递增序号作为 ID
            parent_id = sections[-1]["id"]
            subsection_index = len(sections[-1]["children"]) + 1
            id_str = f"{parent_id}-{subsection_index}"

            sections[-1]["children"].append({
                "id": id_str,
                "text": text,
                "startLine": i,
                "endLine": len(lines)
            })

    # 更新每个章节的结束行号
    for i in range(len(sections) - 1):
        sections[i]["endLine"] = sections[i + 1]["startLine"] - 1

    # 更新 H3 子章节的结束行号
    for section in sections:
        children = section["children"]
        for i in range(len(children) - 1):
            children[i]["endLine"] = children[i + 1]["startLine"] - 1
        # 最后一个 H3 的结束行号 = 父 H2 的结束行号
        if children:
            children[-1]["endLine"] = section["endLine"]

    # 如果没有 H2，则元信息区域到文档末尾
    if first_h2_line is None:
        meta["endLine"] = len(lines)

    return {
        "title": title,
        "meta": meta,
        "sections": sections
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: extract-outline.py <markdown_file>", file=sys.stderr)
        sys.exit(1)

    md_file = sys.argv[1]
    result = extract_outline(md_file)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()