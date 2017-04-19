#!/bin/sh

# $1 example: QD.QidianOverseaDynamicNodeServer

p="../logs"
f="../logs/yuenode.log"

if [ ! -d "$p" ]; then
    mkdir "$p"
fi

if [ ! -e "$f" ]; then
    touch "$f"
fi

t=`date '+%Y-%m-%d %T'`
echo "[$t] stop -> $1" >> "$f"

ps axuw | grep $1 | grep mqq | awk '{print $2;}' | xargs kill
exit 0
