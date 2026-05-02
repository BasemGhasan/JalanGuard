"""
Seed script: Parse GeoJSON and insert Malaysian state boundaries
directly into the remote Supabase PostgreSQL database.

Connects via SUPABASE_DB_PASSWORD + known project ref (no local DB used).

Table schema expected in Supabase:
    malaysian_states (
        id         SERIAL PRIMARY KEY,
        state_name VARCHAR,
        iso_code   VARCHAR UNIQUE,
        geom       geometry(MultiPolygon, 4326)
    )

Usage:
    python scripts/seed_supabase_states.py
"""

import json
import os
import sys

import psycopg2

GEOJSON_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "attached_assets",
    "geoBoundaries-MYS-ADM1_1777764653846.geojson",
)

SUPABASE_REF = "kjlxiciskiqezrtmovvw"
DB_PASSWORD  = os.environ.get("SUPABASE_DB_PASSWORD")

if not DB_PASSWORD:
    sys.exit("ERROR: SUPABASE_DB_PASSWORD environment variable is not set.")

# Supabase session-mode pooler (port 5432) — supports all SQL including PostGIS
SUPABASE_DB_URL = (
    f"postgresql://postgres.{SUPABASE_REF}:{DB_PASSWORD}"
    f"@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
)


def load_geojson(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed(conn, features: list) -> None:
    inserted = 0
    skipped  = 0

    with conn.cursor() as cur:
        for feat in features:
            props      = feat["properties"]
            state_name = props["shapeName"]
            iso_code   = props["shapeISO"]
            geom_json  = json.dumps(feat["geometry"])

            cur.execute(
                """
                INSERT INTO malaysian_states (state_name, iso_code, geom)
                VALUES (
                    %s,
                    %s,
                    ST_SetSRID(
                        ST_Multi(ST_GeomFromGeoJSON(%s)),
                        4326
                    )
                )
                ON CONFLICT (iso_code) DO NOTHING;
                """,
                (state_name, iso_code, geom_json),
            )
            if cur.rowcount == 1:
                inserted += 1
                print(f"  ✓ Inserted: {state_name} ({iso_code})")
            else:
                skipped += 1
                print(f"  ~ Skipped (duplicate): {state_name} ({iso_code})")

    conn.commit()
    print(f"\nResult: {inserted} inserted, {skipped} skipped.")


def verify(conn) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT state_name, iso_code,
                   ST_GeometryType(geom)                   AS geom_type,
                   ROUND(ST_Area(geom::geography) / 1e6)   AS area_km2
            FROM   malaysian_states
            ORDER  BY state_name;
            """
        )
        rows = cur.fetchall()
        print(f"\n{'State':<22} {'ISO':<8} {'Type':<20} {'Area km²':>10}")
        print("-" * 64)
        for r in rows:
            print(f"{r[0]:<22} {r[1]:<8} {r[2]:<20} {r[3]:>10,}")


def main():
    print(f"Loading: {GEOJSON_PATH}")
    data     = load_geojson(GEOJSON_PATH)
    features = data["features"]
    print(f"Found {len(features)} features.\n")

    print(f"Connecting to Supabase ({SUPABASE_REF})…")
    try:
        conn = psycopg2.connect(SUPABASE_DB_URL, connect_timeout=15)
    except Exception as e:
        sys.exit(f"Connection failed: {e}")

    print("✓ Connected to remote Supabase PostgreSQL.\n")

    with conn:
        print("Seeding malaysian_states…\n")
        seed(conn, features)
        print("\nVerifying rows in Supabase:")
        verify(conn)

    conn.close()
    print("\n✓ Seed complete — data is live in Supabase.")


if __name__ == "__main__":
    main()
