#!/bin/bash

BASEDIR=`dirname $0 | awk '{ print $0 "/.." }'`

cd $BASEDIR

PKGDIR=`pwd`

TEMPLATE=vanhack/atoms
NAME=atoms

docker build -t $TEMPLATE $PKGDIR

if [ ! -f config.json ] ; then
	echo "Missing config.json"
	exit
fi

echo "Killing old instance (if any)"
docker kill $NAME
echo "Removing old instance (if any)"
docker rm $NAME
echo "Starting"
docker run -d \
  -p 3004:3004 \
  -v $PKGDIR/shared:/usr/src/app/shared \
  --restart=always \
  --name $NAME \
  -t $TEMPLATE \
  bin/www
