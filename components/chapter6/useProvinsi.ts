"use client";

import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

type Props = { prov: string };
export type FiturProvinsi = Feature<Polygon | MultiPolygon, Props>;

let janji: Promise<FiturProvinsi[]> | null = null;

/** Batas provinsi (gabungan kab/kota), diunduh sekali */
export function useProvinsi() {
  const [data, setData] = useState<FiturProvinsi[] | null>(null);
  useEffect(() => {
    let hidup = true;
    if (!janji) {
      janji = fetch("/data/provinsi.topo.json")
        .then((r) => r.json())
        .then((topo: Topology<{ provinsi: GeometryCollection<Props> }>) => {
          const fc = feature(topo, topo.objects.provinsi) as unknown as FeatureCollection<Polygon | MultiPolygon, Props>;
          return fc.features;
        });
    }
    janji.then((d) => hidup && setData(d)).catch(() => undefined);
    return () => {
      hidup = false;
    };
  }, []);
  return data;
}
