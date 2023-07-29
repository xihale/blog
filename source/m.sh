#!/bin/bash

# 遍历 _posts 文件夹下的所有 index.md 文件
for file in _posts/*/index.md; do
  if [[ -f $file ]]; then
    # 检查文件中是否存在第一个 --- 行
    count=$(grep -c '^<<<<<<< Updated upstream' "$file")
#     echo $count $file

    # 如果存在第一个 --- 行，则在其后面添加 date: 2022-8-15
    if (( count > 0 )); then
      kate $file
#       filedir=$(basename $(dirname $file))
#       echo "---\ntitle: $filedir\ndate: 2022-8-15\n---\n"
#       sed -i '1s/^/---\ntitle: $filedir\ndate: 2022-8-15\n---\n/' "$file"
      echo "Line added in $file"
    fi
  fi
done
