#!/bin/bash

BASEDIR=`dirname "$0/.."`

TEMPLATE=vanhack/atoms
NAME=atoms

docker build -t $TEMPLATE $DIR

echo "Killing old instance (if any)"
docker kill $NAME
echo "Removing old instance (if any)"
docker rm $NAME
echo "Starting"
docker run -p 3004:3004 -d -v shared:/usr/src/app/shared --restart=always --name $NAME \
    -t $TEMPLATE 