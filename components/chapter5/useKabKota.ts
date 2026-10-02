"use client";

import { useEffect, useState } from "react";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, FeatureCollection, MultiLineString, MultiPolygon, Polygon } from "geojson";

type Props = { id: string; prov: string };
export type FiturKabKota = Feature<Polygon | MultiPolygon, Props>;

export interface DataBatas {
  kabkota: FiturKabKota[];
  batasProvinsi: MultiLineString;
  garisPantai: MultiLineString;
  semua: FeatureCollection<Polygon | MultiPolygon, Props>;
}

// Diunduh sekali, lalu dipakai bersama oleh semua peta (Bab 5, 6, 7)
let janji: Promise<DataBatas> | null = null;

function muat(): Promise<DataBatas> {
  if (!janji) {
    janji = fetch("/data/kabkota.topo.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Gagal memuat batas wilayah (${r.status})`);
        return r.json();
      })
      .then((topo: Topology<{ kabkota: GeometryCollection<Props> }>) => {
        const obj = topo.objects.kabkota;
        const semua = feature(topo, obj) as unknown as FeatureCollection<Polygon | MultiPolygon, Props>;
        return {
          kabkota: semua.features,
          semua,
          batasProvinsi: mesh(
            topo,
            obj,
            (a, b) => a !== b && (a.properties as Props | undefined)?.prov !== (b.properties as Props | undefined)?.prov
          ),
          garisPantai: mesh(topo, obj, (a, b) => a === b),
        };
      });
  }
  return janji;
}

export function useKabKota() {
  const [data, setData] = useState<DataBatas | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  useEffect(() => {
    let hidup = true;
    muat()
      .then((d) => hidup && setData(d))
      .catch((e: Error) => hidup && setGalat(e.message));
    return () => {
      hidup = false;
    };
  }, []);
  return { data, galat };
}
