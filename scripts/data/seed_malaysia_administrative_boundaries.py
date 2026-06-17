import os
import json
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ==========================================
# ⚙️ CONFIGURATION & SECURITY
# ==========================================
load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    raise ValueError("❌ DATABASE_URL is missing! Please add it to your .env file.")

FILES = [
    {"path": os.path.join(BASE_DIR, "mys_admin0.geojson"), "level": 0, "name_key": "adm0_name"}, 
    {"path": os.path.join(BASE_DIR, "mys_admin1.geojson"), "level": 1, "name_key": "adm1_name"}, 
    {"path": os.path.join(BASE_DIR, "mys_admin2.geojson"), "level": 2, "name_key": "adm2_name"}  
]

# ==========================================
# 🚀 UPLOAD LOGIC
# ==========================================
def upload_boundaries():
    print("Connecting to Supabase PostgreSQL securely...")
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # First, let's wipe the existing corrupted geometries to start fresh
    print("Wiping existing administrative boundaries...")
    cur.execute("""
        UPDATE public.hazards
        SET adm0_id = NULL,
            adm1_id = NULL,
            adm2_id = NULL;
    """)
    cur.execute("DELETE FROM public.administrative_boundaries;")
    conn.commit()

    for config in FILES:
        try:
            with open(config["path"], "r", encoding="utf-8") as f:
                geojson = json.load(f)
        except FileNotFoundError:
            print(f"⚠️ File not found: {config['path']} - Skipping...")
            continue

        features = geojson.get("features", [])
        print(f"Processing {len(features)} boundaries for ADM Level {config['level']}...")

        records = []
        for feat in features:
            props = feat.get("properties", {})
            name = props.get(config["name_key"]) or props.get("name") or props.get("shapeName") or "Unknown Area"
            geom = json.dumps(feat.get("geometry"))
            records.append((name, config["level"], geom))

        # FIXED QUERY: Explicitly set the SRID to 4326 so it aligns with standard GPS coordinates
        query = """
            INSERT INTO public.administrative_boundaries (name, adm_level, geom)
            VALUES (%s, %s, ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON(%s)), 4326));
        """
        
        try:
            execute_batch(cur, query, records)
            conn.commit()
            print(f"✅ Successfully uploaded ADM Level {config['level']}!")
        except Exception as e:
            print(f"❌ Failed to insert ADM Level {config['level']}: {e}")
            conn.rollback()

    # ==========================================
    # 🛠 THE BACKFILL FIX
    # ==========================================
    try:
        cur.execute("""
            -- CRITICAL FIX 1: Ensure location_point exists and is mathematically (Longitude, Latitude)
            UPDATE public.hazards
            SET location_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

            UPDATE public.hazards
            SET adm0_id = NULL,
                adm1_id = NULL,
                adm2_id = NULL;

            -- CRITICAL FIX 2: Now run the backfill intersections
            UPDATE public.hazards h
            SET adm0_id = b.id
            FROM public.administrative_boundaries b
            WHERE h.location_point IS NOT NULL
                AND b.adm_level = 0
                AND ST_Intersects(h.location_point, b.geom);

            UPDATE public.hazards h
            SET adm1_id = b.id
            FROM public.administrative_boundaries b
            WHERE h.location_point IS NOT NULL
                AND b.adm_level = 1
                AND ST_Intersects(h.location_point, b.geom);

            UPDATE public.hazards h
            SET adm2_id = b.id
            FROM public.administrative_boundaries b
            WHERE h.location_point IS NOT NULL
                AND b.adm_level = 2
                AND ST_Intersects(h.location_point, b.geom);
        """)
        conn.commit()
        print("✅ Existing hazards correctly built and backfilled with ADM boundaries!")
    except Exception as e:
        print(f"❌ Failed to backfill hazard boundaries: {e}")
        conn.rollback()

    # Rebuild the materialized views
    try:
        cur.execute("""
            DROP MATERIALIZED VIEW IF EXISTS public.choropleth_stats_adm0 CASCADE;
            DROP MATERIALIZED VIEW IF EXISTS public.choropleth_stats_adm1 CASCADE;
            DROP MATERIALIZED VIEW IF EXISTS public.choropleth_stats_adm2 CASCADE;

            CREATE MATERIALIZED VIEW public.choropleth_stats_adm0 AS
            SELECT
                b.id AS boundary_id,
                b.name AS country_name,
                ST_AsGeoJSON(ST_Simplify(b.geom, 0.001))::json AS geojson,
                COUNT(h.id) AS total_reports,
                SUM(CASE WHEN UPPER(h.severity::text) = 'HIGH' THEN 1 ELSE 0 END) AS severity_high_count,
                SUM(CASE WHEN UPPER(h.severity::text) = 'MEDIUM' THEN 1 ELSE 0 END) AS severity_medium_count,
                SUM(CASE WHEN UPPER(h.severity::text) = 'LOW' THEN 1 ELSE 0 END) AS severity_low_count
            FROM public.administrative_boundaries b
            LEFT JOIN public.hazards h ON b.id = h.adm0_id
            WHERE b.adm_level = 0
            GROUP BY b.id, b.name, b.geom;

            CREATE MATERIALIZED VIEW public.choropleth_stats_adm1 AS
            SELECT
                b.id AS boundary_id,
                b.name AS state_name,
                ST_AsGeoJSON(ST_Simplify(b.geom, 0.001))::json AS geojson,
                COUNT(h.id) AS total_reports,
                SUM(CASE WHEN UPPER(h.severity::text) = 'HIGH' THEN 1 ELSE 0 END) AS severity_high_count,
                SUM(CASE WHEN UPPER(h.severity::text) = 'MEDIUM' THEN 1 ELSE 0 END) AS severity_medium_count,
                SUM(CASE WHEN UPPER(h.severity::text) = 'LOW' THEN 1 ELSE 0 END) AS severity_low_count
            FROM public.administrative_boundaries b
            LEFT JOIN public.hazards h ON b.id = h.adm1_id
            WHERE b.adm_level = 1
            GROUP BY b.id, b.name, b.geom;

            CREATE MATERIALIZED VIEW public.choropleth_stats_adm2 AS
            SELECT
                b.id AS boundary_id,
                b.name AS district_name,
                ST_AsGeoJSON(ST_Simplify(b.geom, 0.001))::json AS geojson,
                COUNT(h.id) AS total_reports,
                SUM(CASE WHEN UPPER(h.severity::text) = 'HIGH' THEN 1 ELSE 0 END) AS severity_high_count,
                SUM(CASE WHEN UPPER(h.severity::text) = 'MEDIUM' THEN 1 ELSE 0 END) AS severity_medium_count,
                SUM(CASE WHEN UPPER(h.severity::text) = 'LOW' THEN 1 ELSE 0 END) AS severity_low_count
            FROM public.administrative_boundaries b
            LEFT JOIN public.hazards h ON b.id = h.adm2_id
            WHERE b.adm_level = 2
            GROUP BY b.id, b.name, b.geom;

            CREATE UNIQUE INDEX IF NOT EXISTS idx_choropleth_adm0 ON public.choropleth_stats_adm0(boundary_id);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_choropleth_adm1 ON public.choropleth_stats_adm1(boundary_id);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_choropleth_adm2 ON public.choropleth_stats_adm2(boundary_id);
        """)
        conn.commit()
        print("✅ Choropleth materialized views rebuilt successfully!")
    except Exception as e:
        print(f"❌ Failed to rebuild choropleth views: {e}")
        conn.rollback()

    cur.close()
    conn.close()
    print("\n🎉 All spatial data uploaded and mapped successfully!")

if __name__ == "__main__":
    upload_boundaries()