#!/bin/bash

set -e

export DEBUG="tacos:migrations:*"

cd "$(dirname "$(realpath "$0")")/.." || exit 255

# shellcheck source=/dev/null
if [ ! -f config/config.json ]; then
    echo "Missing config file"
    exit 254
fi

DATADIR=$(grep -w datadir config/config.json | cut -f4 -d'"')
DONEDIR="${DATADIR}/migrations/"

mkdir -p "${DONEDIR}"

find migrations/ -type f -print0 | xargs -0 -n1 basename | while read -r MIGRATION_FILE; do
    if [ ! -f "${DONEDIR}/${MIGRATION_FILE}" ]; then
        if "./migrations/${MIGRATION_FILE}"; then
            cp "./migrations/${MIGRATION_FILE}" "./${DONEDIR}/${MIGRATION_FILE}"
        fi
    fi
done
