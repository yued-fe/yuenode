#!/bin/bash
#Evkoe Taf to auto restart boss node server.
#Author:liangchen
kill `lsof -i:10302 | awk '$5=="IPv4" { print $2}'`
exit 0

# HOST=`ip addr|grep inet|grep eth1|awk '{print $2}'|sed 's/\/.*//'`
# if [ "$HOST" = "" ];then
#     HOST="localhost"
# fi

# PORT=10302
# PATH="qdadmin/reload"

# if [ $# -gt 0 ];then
# 	PORT=$1
# fi

# /usr/bin/curl http://$HOST:$PORT/$PATH