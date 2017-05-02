#!/bin/sh

# n 为 *.config.js 中的服务别名 name , example: oversea
n="oversea"

p="../logs"
f="../logs/yuenode/oversea.log"

if [ ! -d "$p" ]; then
    mkdir "$p"
fi

if [ ! -e "$f" ]; then
    touch "$f"
fi

t=`date '+%Y-%m-%d %T'`
echo "[$t] reload -> $n" >> "$f"

pm2 reload $n
exit 0