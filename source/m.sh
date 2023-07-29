#!/bin/bash

# 遍历 _posts 文件夹下的所有 index.md 文件
for file in _posts/*/index.md; do
  if [[ -f $file ]]; then
    # 检查文件中是否存在两个 date: 行
    count=$(grep -c '^date:' "$file")
    echo $count $file

    if (( count >= 2 )); then
      # 删除第一个 date: 行
      sed -i '0,/^\s*date:.*/{0,/^date:/s/^date:.*//}' "$file"
      echo "Line deleted in $file"
    fi
  fi
done
