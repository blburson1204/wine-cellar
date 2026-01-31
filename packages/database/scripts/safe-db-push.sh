#!/usr/bin/env bash
# Safe wrapper around prisma db push that checks for existing data,
# creates a backup if rows exist, and requires confirmation before proceeding.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"
SCHEMA="$DB_DIR/prisma/schema.prisma"

# Extract database connection info from DATABASE_URL
DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5433/wine_cellar}"
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\(.*\):\([0-9]*\)/.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@\(.*\):\([0-9]*\)/.*|\2|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

echo "=== Safe Database Push ==="
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Check row count in Wine table
ROW_COUNT=$(docker exec wine-cellar-db psql -U postgres -d "$DB_NAME" -t -c 'SELECT COUNT(*) FROM "Wine";' 2>/dev/null | tr -d ' ' || echo "0")

if [ "$ROW_COUNT" -gt "0" ] 2>/dev/null; then
    echo "WARNING: Wine table contains $ROW_COUNT rows."
    echo ""

    # Create timestamped backup table
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_TABLE="Wine_backup_$TIMESTAMP"

    echo "Creating backup: \"$BACKUP_TABLE\"..."
    docker exec wine-cellar-db psql -U postgres -d "$DB_NAME" -c \
        "CREATE TABLE \"$BACKUP_TABLE\" AS SELECT * FROM \"Wine\";" >/dev/null
    BACKUP_COUNT=$(docker exec wine-cellar-db psql -U postgres -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM \"$BACKUP_TABLE\";" | tr -d ' ')
    echo "Backed up $BACKUP_COUNT rows to \"$BACKUP_TABLE\"."
    echo ""

    # Require explicit confirmation
    echo "prisma db push may DROP and RECREATE the Wine table."
    read -r -p "Proceed with db push? (type 'yes' to confirm): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        echo "Aborted. Your data is safe. Backup table \"$BACKUP_TABLE\" was kept."
        exit 1
    fi
else
    echo "Wine table is empty (or does not exist yet). Proceeding."
fi

echo ""
echo "Running: prisma db push..."
cd "$DB_DIR"
npx prisma db push

echo ""
echo "db push complete."
if [ "$ROW_COUNT" -gt "0" ] 2>/dev/null; then
    NEW_COUNT=$(docker exec wine-cellar-db psql -U postgres -d "$DB_NAME" -t -c 'SELECT COUNT(*) FROM "Wine";' 2>/dev/null | tr -d ' ' || echo "0")
    if [ "$NEW_COUNT" -eq "0" ] 2>/dev/null && [ "$ROW_COUNT" -gt "0" ] 2>/dev/null; then
        echo ""
        echo "DATA WAS LOST: Wine table is now empty (was $ROW_COUNT rows)."
        echo "To restore: docker exec wine-cellar-db psql -U postgres -d $DB_NAME -c 'INSERT INTO \"Wine\" SELECT * FROM \"$BACKUP_TABLE\";'"
    else
        echo "Wine table has $NEW_COUNT rows."
    fi
fi
