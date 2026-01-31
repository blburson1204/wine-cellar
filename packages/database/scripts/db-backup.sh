#!/usr/bin/env bash
# Create a backup of the Wine table in the development database.
# Usage: ./db-backup.sh [backup_name]

set -euo pipefail

DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5433/wine_cellar}"
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${1:-Wine_backup_$TIMESTAMP}"

ROW_COUNT=$(docker exec wine-cellar-db psql -U postgres -d "$DB_NAME" -t -c 'SELECT COUNT(*) FROM "Wine";' 2>/dev/null | tr -d ' ' || echo "0")

if [ "$ROW_COUNT" -eq "0" ] 2>/dev/null; then
    echo "Wine table is empty. Nothing to back up."
    exit 0
fi

echo "Backing up $ROW_COUNT wines to \"$BACKUP_NAME\"..."
docker exec wine-cellar-db psql -U postgres -d "$DB_NAME" -c \
    "CREATE TABLE \"$BACKUP_NAME\" AS SELECT * FROM \"Wine\";" >/dev/null

BACKUP_COUNT=$(docker exec wine-cellar-db psql -U postgres -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM \"$BACKUP_NAME\";" | tr -d ' ')
echo "Done. $BACKUP_COUNT rows backed up."
echo ""
echo "To restore: docker exec wine-cellar-db psql -U postgres -d $DB_NAME -c 'INSERT INTO \"Wine\" SELECT * FROM \"$BACKUP_NAME\";'"
