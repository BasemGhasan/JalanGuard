"""
Seed script: Parse geoBoundaries-MYS-ADM1.geojson and insert
Malaysian state boundaries into the 'malaysian_states' table
with PostGIS geometry (SRID 4326).

Usage:
    python scripts/seed_malaysian_states.py

Requires:
    - DATABASE_URL environment variable (PostgreSQL with PostGIS)
    - psycopg2-binary
"""

import json
import os
import sys

import psycopg2
from psycopg2.extras import execute_values

GEOJSON_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "attached_assets",
    "geoBoundaries-MYS-ADM1_1777761825261.geojson",
)

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    sys.exit("ERROR: DATABASE_URL environment variable is not set.")


def load_geojson(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_rows(geojson: dict) -> list[tuple]:
    """
    Convert GeoJSON features to DB rows.
    Returns list of (name, iso_code, shape_id, geojson_geometry_str).
    """
    rows = []
    for feature in geojson["features"]:
        props = feature["properties"]
        name = props["shapeName"]
        iso_code = props["shapeISO"]
        shape_id = props.get("shapeID", "")
        # Serialize geometry back to JSON string for ST_GeomFromGeoJSON
        geom_json = json.dumps(feature["geometry"])
        rows.append((name, iso_code, shape_id, geom_json))
    return rows


def seed(rows: list[tuple], conn) -> None:
    with conn.cursor() as cur:
        inserted = 0
        skipped = 0
        for name, iso_code, shape_id, geom_json in rows:
            cur.execute(
                """
                INSERT INTO malaysian_states (name, iso_code, shape_id, geom)
                VALUES (
                    %s,
                    %s,
                    %s,
                    ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)
                )
                ON CONFLICT (iso_code) DO NOTHING;
                """,
                (name, iso_code, shape_id, geom_json),
            )
            if cur.rowcount == 1:
                inserted += 1
                print(f"  ✓ Inserted: {name} ({iso_code})")
            else:
                skipped += 1
                print(f"  ~ Skipped (duplicate): {name} ({iso_code})")
        conn.commit()
        print(f"\nDone. {inserted} inserted, {skipped} skipped.")


def verify(conn) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT name, iso_code,
                   ST_GeometryType(geom) AS geom_type,
                   ST_SRID(geom)         AS srid,
                   ROUND(ST_Area(geom::geography) / 1e6) AS area_km2
            FROM   malaysian_states
            ORDER  BY name;
            """
        )
        rows = cur.fetchall()
        print(f"\n{'State':<22} {'ISO':<8} {'Geom Type':<20} {'SRID':<6} {'Area (km²)':>10}")
        print("-" * 72)
        for row in rows:
            print(f"{row[0]:<22} {row[1]:<8} {row[2]:<20} {row[3]:<6} {row[4]:>10,}")


def main():
    print(f"Loading GeoJSON from: {GEOJSON_PATH}")
    geojson = load_geojson(GEOJSON_PATH)
    rows = build_rows(geojson)
    print(f"Found {len(rows)} features.\n")

    print(f"Connecting to database…")
    with psycopg2.connect(DATABASE_URL) as conn:
        print("Seeding malaysian_states table…\n")
        seed(rows, conn)
        print("\nVerifying inserted rows:")
        verify(conn)

    print("\nSeed complete.")


if __name__ == "__main__":
    main()
