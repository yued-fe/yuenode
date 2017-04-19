#!/bin/sh

# $1 为 *.config.js 中的服务别名 name , example: oversea

p="../logs"
f="../logs/yuenode.log"

if [ ! -d "$p" ]; then
    mkdir "$p"
fi

if [ ! -e "$f" ]; then
    touch "$f"
fi

t=`date '+%Y-%m-%d %T'`
echo "[$t] reload -> $1" >> "$f"

pm2 reload $1
exit 0