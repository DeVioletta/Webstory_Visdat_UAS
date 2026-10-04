import { chapter7Data } from "@/content/chapter7";
import styles from "./chapter7.module.css";

const { ch5, ch6 } = chapter7Data;

export default function Metodologi() {
  return (
    <div className={styles.method}>
      <details open>
        <summary>Sumber data utama (BPS)</summary>
        <ul>
          <li>
            Nilai FOB ekspor dan impor menurut SITC 3 digit, 2024 dan 2025.
            <a href="https://www.bps.go.id/id/publication/2026/08/31/e15722f0d16e51d9c64536a2/statistik-perdagangan-luar-negeri-indonesia-menurut-kode-sitc--2004-dan-2025.html" target="_blank" rel="noopener noreferrer">
              <i>Statistik Perdagangan Luar Negeri Indonesia Menurut Kode SITC, 2024 dan 2025</i>
            </a>,
            diakses 26/09/2026.
          </li>
          <li>
            Nilai ekspor dan impor menurut negara, 2024 dan 2025.
            <a href="https://www.bps.go.id/id/publication/2026/08/31/e15722f0d16e51d9c64536a2/statistik-perdagangan-luar-negeri-indonesia-menurut-kode-sitc--2004-dan-2025.html" target="_blank" rel="noopener noreferrer">
              <i>Statistik Perdagangan Luar Negeri Indonesia Menurut Kode SITC, 2024 dan 2025</i>
            </a>,
            diakses 26/09/2026.
          </li>
          <li>
            Neraca energi Indonesia tahun 2024.
            <a href="https://www.bps.go.id/id/publication/2025/12/31/08fbe1e409d6fe8a83688144/neraca-energi-indonesia-2020-2024.html" target="_blank" rel="noopener noreferrer">
              <i>Neraca Energi Indonesia 2020–2024</i>
            </a>,
            diakses 26/09/2026.
          </li>
          <li>
            Neraca batubara tahun 2020–2024.
            <a href="https://www.bps.go.id/id/publication/2025/12/31/08fbe1e409d6fe8a83688144/neraca-energi-indonesia-2020-2024.html" target="_blank" rel="noopener noreferrer">
              <i>Neraca Energi Indonesia 2020–2024</i>
            </a>,
            diakses 26/09/2026.
          </li>
          <li>
            PDRB per kapita ADHB dan PDRB ADHB kabupaten/kota tahun 2025.
            <a href="https://www.bps.go.id/id/publication/2026/06/10/234d5061d35a199c70e77766/produk-domestik-regional-bruto-kabupaten-kota-di-indonesia-2021-2025.html" target="_blank" rel="noopener noreferrer">
              <i>Produk Domestik Regional Bruto Kabupaten/Kota di Indonesia 2021–2025</i>
            </a>,
            diakses 26/09/2026.
          </li>
          <li>
            PDRB per kapita ADHB provinsi tahun 2025.
            <a href="https://www.bps.go.id/id/publication/2026/04/13/71d97fa95c70c5049deecbab/produk-domestik-regional-bruto-provinsi-provinsi-di-indonesia-menurut-lapangan-usaha-2021-2025.html" target="_blank" rel="noopener noreferrer">
              <i>Produk Domestik Regional Bruto Provinsi-Provinsi di Indonesia Menurut Lapangan Usaha 2021–2025</i>
            </a>,
            diakses 26/09/2026.
          </li>
        </ul>
      </details>

      <details>
        <summary>Data referensi di luar BPS</summary>
        <ul>
          <li>
            Batas kabupaten/kota dengan kode wilayah Kemendagri.
            <a href="https://www.lapakgis.com/2022/01/shp-batas-kabupaten-kota-indonesia.html " target="_blank" rel="noopener noreferrer">
              LapakGIS
            </a>,
            diakses 26/09/2026.
          </li>
          <li>
            Batas negara dalam format TopoJSON.
            <a href="https://github.com/topojson/world-atlas" target="_blank" rel="noopener noreferrer">
              <i>topojson/world-atlas</i>
            </a>,
            diakses 01/10/2026.
          </li>
          <li>
            Kode ISO, koordinat, dan subregion negara.
            <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener noreferrer">
              <i>mledoze/countries</i>
            </a>,
            diakses 01/10/2026.
          </li>
        </ul>
        <p>
          Data referensi di luar BPS hanya digunakan untuk kebutuhan pemetaan,
          sedangkan seluruh nilai yang dianalisis dan divisualisasikan bersumber dari BPS.
        </p>
      </details>

      <details>
        <summary>Metode dan rumus</summary>
        <dl>
          <dt>Indeks spesialisasi perdagangan (Bab 3)</dt>
          <dd>(ekspor &minus; impor) / (ekspor + impor). Di setiap tingkat hirarki dihitung dari nilai yang dijumlahkan.</dd>
          <dt>Perubahan (Bab 4)</dt>
          <dd>(nilai 2025 &minus; nilai 2024) / nilai 2024 &times; 100%. Skala warna dibatasi &plusmn;50%.</dd>
          <dt>Klasifikasi peta (Bab 5)</dt>
          <dd>Kuantil, 5 kelas dengan jumlah daerah yang sama. Natural breaks (Fisher-Jenks) disediakan sebagai pembanding.</dd>
          <dt>Moran&apos;s I dan LISA (Bab 5)</dt>
          <dd>
            Variabel {ch5.moran.variabel}. Bobot queen contiguity dengan standarisasi baris; {ch5.moran.jumlahPulau} daerah
            kepulauan tanpa tetangga darat diberi satu tetangga terdekat. {ch5.moran.permutasi} permutasi, &alpha; = 0,05,
            dihitung dari batas resolusi asli. Hasil: I = {ch5.moran.I.toFixed(3).replace(".", ",")}, p ={" "}
            {ch5.moran.p.toFixed(3).replace(".", ",")}.
          </dd>
          <dt>Penduduk (Bab 6)</dt>
          <dd>Diturunkan dari PDRB dibagi PDRB per kapita, sehingga konsisten dengan angka yang dipetakan.</dd>
          <dt>Indeks Williamson dan Gini antarwilayah (Bab 6)</dt>
          <dd>
            Williamson = &radic;[&Sigma;(y<sub>i</sub> &minus; &#563;)&sup2; &times; P<sub>i</sub>/P] / &#563;. Gini dari kurva
            Lorenz PDRB terhadap penduduk dengan metode trapesium. Hasil: {ch6.nasional.williamson.toFixed(3).replace(".", ",")}{" "}
            dan {ch6.nasional.gini.toFixed(3).replace(".", ",")}.
          </dd>
          <dt>Simbol proporsional (Bab 6)</dt>
          <dd>Luas lingkaran sebanding dengan PDRB total (jari-jari memakai akar kuadrat).</dd>
        </dl>
      </details>

      <details>
        <summary>Perangkat dan palet warna</summary>
        <ul>
          <li>Situs: Next.js dan React; grafik dengan d3-sankey, d3-hierarchy, d3-geo, d3-shape, dan topojson.</li>
          <li>Pengolahan data: Python (pandas, geopandas, libpysal, esda, mapclassify) dan mapshaper.</li>
          <li>
            Palet: Okabe-Ito untuk kategori, ColorBrewer (YlGnBu, BrBG) untuk skala berurutan dan divergen. Semua dipilih agar
            dapat dibaca pembaca buta warna.
          </li>
        </ul>
      </details>
      <details>
      <summary>Daftar pustaka</summary>
      <ol>
        <li>
          Badan Pusat Statistik, <i>Statistik Perdagangan Luar Negeri Indonesia Menurut Kode SITC, 2024 dan 2025</i>.
          Jakarta, Indonesia: Badan Pusat Statistik, 2026.
        </li>

        <li>
          A. Ambya and L. M. Hamzah, “Indonesian Coal Exports: Dynamic Panel Analysis Approach,”
          <i>International Journal of Energy Economics and Policy</i>, vol. 12, no. 1,
          pp. 390–395, Jan. 2022, doi: 10.32479/ijeep.11978.
        </li>

        <li>
          F. Santos-Marquez, A. B. Gunawan, and C. Mendez,
          “Regional income disparities, distributional convergence, and spatial effects:
          Evidence from Indonesian regions 2010–2017,” <i>GeoJournal</i>, vol. 87, no. 3,
          pp. 2373–2391, Jun. 2022, doi: 10.1007/s10708-021-10377-7.
        </li>

        <li>
          Badan Pusat Statistik, <i>Produk Domestik Regional Bruto Kabupaten/Kota di Indonesia 2021–2025</i>.
          Jakarta, Indonesia: Badan Pusat Statistik, 2026.
        </li>

        <li>
          E. Segel and J. Heer, “Narrative visualization: Telling stories with data,”
          <i>IEEE Transactions on Visualization and Computer Graphics</i>, vol. 16, no. 6,
          pp. 1139–1148, Nov./Dec. 2010, doi: 10.1109/TVCG.2010.179.
        </li>

        <li>
          D. Seyser and M. Zeiller, “Scrollytelling—an analysis of visual storytelling in online journalism,”
          <i>Information Visualisation - Biomedical Visualization, Visualisation on Built and Rural Environments and Geometric Modelling and Imaging</i>,
          pp. 401–406, Dec. 2018, doi: 10.1109/IV.2018.00075.
        </li>

        <li>
          E. Mörth, S. Bruckner, and N. N. Smit,
          “ScrollyVis: Interactive visual authoring of guided dynamic narratives for scientific scrollytelling,”
          <i>IEEE Transactions on Visualization and Computer Graphics</i>, vol. 29, no. 12,
          pp. 5165–5177, Dec. 2023, doi: 10.1109/TVCG.2022.3205769.
        </li>

        <li>
          Eurostat, “Energy flow diagrams,” Eurostat. [Online].
          Available: https://ec.europa.eu/eurostat/cache/sankey/energy/sankey.html
          (accessed Oct. 1, 2026).
        </li>

        <li>
          B. Jenny <i>et al.</i>, “Design principles for origin-destination flow maps,”
          <i>Cartography and Geographic Information Science</i>, vol. 45, no. 1,
          pp. 62–75, Jan. 2018, doi: 10.1080/15230406.2016.1262280.
        </li>

        <li>
          W. Scheibel, M. Trapp, D. Limberger, and J. Döllner,
          “A taxonomy of treemap visualization techniques,” in
          <i>VISIGRAPP 2020 - Proceedings of the 15th International Joint Conference on
          Computer Vision, Imaging and Computer Graphics Theory and Applications</i>,
          SciTePress, 2020, pp. 273–280, doi: 10.5220/0009153902730280.
        </li>

        <li>
          K. Rodden, “Applying a sunburst visualization to summarize user navigation sequences,”
          <i>IEEE Computer Graphics and Applications</i>, vol. 34, no. 5, pp. 36–40,
          Sep. 2014, doi: 10.1109/MCG.2014.63.
        </li>

        <li>
          K. Słomska-Przech and I. M. Gołębiowska,
          “Do different map types support map reading equally? Comparing choropleth,
          graduated symbols, and isoline maps for map use tasks,”
          <i>ISPRS International Journal of Geo-Information</i>, vol. 10, no. 2,
          Feb. 2021, doi: 10.3390/ijgi10020069.
        </li>

        <li>
          R. Barvir, M. Holub, and A. Vondrakova,
          “Proportional Symbol Maps: Value-Scale Types, Online Value-Scale Generator and User Perspectives,”
          <i>ISPRS International Journal of Geo-Information</i>, vol. 14, no. 9,
          Sep. 2025, doi: 10.3390/ijgi14090340.
        </li>

        <li>
          L. Anselin, “Local indicators of spatial association—LISA,”
          <i>Geographical Analysis</i>, vol. 27, no. 2, pp. 93–115, 1995,
          doi: 10.1111/j.1538-4632.1995.tb00338.x.
        </li>

        <li>
          R. Abdulah, “Mapping Food Security in Indonesia: Geographic Clusters and Regional Disparities,”
          <i>Indonesian Journal of Geography</i>, vol. 57, no. 3, pp. 440–447, 2025,
          doi: 10.22146/ijg.99419.
        </li>

        <li>
          R. Wirth and J. Hipp, “CRISP-DM: Towards a standard process model for data mining,”
          in <i>Proc. 4th Int. Conf. Practical Appl. Knowl. Discovery Data Mining</i>,
          Manchester, U.K., Apr. 2000, vol. 1, pp. 29–39.
        </li>

        <li>
          Badan Pusat Statistik, <i>Neraca Energi Indonesia 2020–2024</i>.
          Jakarta, Indonesia: Badan Pusat Statistik, 2026.
        </li>

        <li>
          Badan Pusat Statistik,
          <i>Produk Domestik Regional Bruto Provinsi-Provinsi di Indonesia Menurut Lapangan Usaha 2021–2025</i>.
          Jakarta, Indonesia: Badan Pusat Statistik, 2026.
        </li>

        <li>
          Lapak GIS, “SHP batas kabupaten kota Indonesia terbaru,” Lapak GIS. [Online].
          Available: https://www.lapakgis.com/2022/01/shp-batas-kabupaten-kota-indonesia.html
          (accessed Sept. 26, 2026).
        </li>

        <li>
          M. Bostock, “world-atlas: Pre-built TopoJSON from Natural Earth,” ver. 2.0.2,
          GitHub repository. [Online].
          Available: https://github.com/topojson/world-atlas
          (accessed Oct. 1, 2026).
        </li>

        <li>
          mledoze and contributors, “countries: World countries in JSON, CSV, XML and YAML,”
          GitHub repository (npm package <i>world-countries</i> ver. 5.1.0). [Online].
          Available: https://github.com/mledoze/countries
          (accessed Oct. 1, 2026).
        </li>

        <li>
          P. L. Iapadre, “Measuring international specialization,”
          <i>International Advances in Economic Research</i>, vol. 7, no. 2,
          pp. 173–183, 2001, doi: 10.1007/BF02296007.
        </li>

        <li>
          J. G. Williamson, “Regional Inequality and the Process of National Development:
          A Description of the Patterns,” <i>Economic Development and Cultural Change</i>,
          vol. 13, no. 4, Part 2, pp. 1–84, Jul. 1965, doi: 10.1086/450136.
        </li>

        <li>
          N. Hamadeh, M. Mouyelo-Katoula, P. Konijn, and F. Koechlin,
          “Purchasing Power Parities of Currencies and Real Expenditures from the International
          Comparison Program: Recent Results and Uses,” <i>Social Indicators Research</i>,
          vol. 131, no. 1, pp. 23–42, Mar. 2017, doi: 10.1007/s11205-015-1215-z.
        </li>

        <li>
          M. C. Brown, “Using gini-style indices to evaluate the spatial patterns of health practitioners:
          Theoretical considerations and an application based on Alberta data,”
          <i>Social Science & Medicine</i>, vol. 38, no. 9, pp. 1243–1256, May 1994,
          doi: 10.1016/0277-9536(94)90189-9.
        </li>

        <li>
          M. Okabe and K. Ito, “Color Universal Design (CUD): How to make figures and presentations
          that are friendly to colorblind people,” J*Fly, 2008. [Online].
          Available: https://jfly.uni-koeln.de/color/
          (accessed Oct. 1, 2026).
        </li>

        <li>
          M. Harrower and C. A. Brewer,
          “ColorBrewer.org: An online tool for selecting colour schemes for maps,”
          <i>The Cartographic Journal</i>, vol. 40, no. 1, pp. 27–37, 2003.
        </li>

        <li>
          Colblindor, “Coblis - Color blindness simulator,” Color-Blindness.com. [Online].
          Available: https://www.color-blindness.com/coblis-color-blindness-simulator/
          (accessed Oct. 4, 2026).
        </li>
      </ol>
    </details>
    </div>
  );
}
