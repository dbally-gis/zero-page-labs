---
generated_by: "OpenAI Codex (exact model variant not exposed)"
timestamp: "2026-11-27T16:41:08-06:00"
---

# Map Monsters: evidence and date decisions

## Scope

The three plates are selected comparisons of European depictions, mainly northern seas, c. 1265–1873. Thirty occupied cells use 31 crops from 25 input scans. Sequence is editorial: it does not demonstrate a continuous transmission of images or a steady transition from fantasy to science. The original VIII–X numbers remain because they are embedded in the inherited artistic images; the page explains the numbering.

## Dates checked on 2026-11-27

### Montfort: An X, 1801–1802

The [BHL bibliographic record](https://www.biodiversitylibrary.org/bibliography/51804) explicitly says volumes 1–4 are dated An X, explains the Republican calendar range, and states that exact publication months are unknown. The [Smithsonian copy of volume II](https://www.biodiversitylibrary.org/item/206416?t=51804) is catalogued as 1802; the [Harvard copy](https://www.biodiversitylibrary.org/item/110561?t=51804) is catalogued as 1801. Use **An X (1801–1802)**, not an asserted exact Gregorian publication year. This range is supported by the volume-level catalogue notes.

The supplied [Commons reproduction](https://commons.wikimedia.org/wiki/File:Denys_de_Montfort_Poulpe_Colossal.jpg) has an 1810 date, lists Ellis's 1994 book as its source, and contains archive-photo metadata. It is not established as a scan of the particular first-edition sheet. The source plate and specimen note explicitly distinguish the work's date from the reproduction's unresolved edition. No authenticity claim about this reproduction was added. A direct first-edition replacement would improve this cell when one can be retrieved and compared.

### Logy Bay: 1873 specimen, photograph c. 1873–1874

The [Harvard MCZ 2023–24 report, printed p. 7](https://www.mcz.harvard.edu/sites/g/files/omnuum6431/files/mcz/files/mcz_ar_2023-24_web_final_ada.pdf) dates the catch and pictured specimen to 1873 and describes Harvey arranging photographic documentation. The [Smithsonian Ocean caption](https://ocean.si.edu/ocean-life/invertebrates/giant-squid) calls the bath photograph 1874, while its narrative describes the specimen in late 1873. The [supplied scan record](https://commons.wikimedia.org/wiki/File:Logy_Bay_giant_squid,_1873.jpg) says November 1873 and identifies Verrill's annotations.

These institutional captions do not establish one exact exposure date. Use **1873 specimen; photograph c. 1873–74**. This is a conservative bracket based on the conflicting captions, not a newly verified exposure date. Do not call it film, equate the annotations with the original photograph, or claim the entire body is draped over the bath: the supplied photograph shows the head/arms region.

An accessible 1874 [Verrill paper](https://ajsonline.org/article/65098-the-gigantic-cephalopods-of-the-north-atlantic/attachment/143545.pdf) was retrieved and text-extracted for checking, but it discusses the earlier severed tentacle and compares it with Logie Bay. It does not resolve the exact bath-photograph exposure date; it is not cited as if it did. Temporary copy is in `.tmp/verrill-paper.pdf`.

### Other date distinctions

- [Daedalus, LOC 2003680172](https://www.loc.gov/item/2003680172/): Illustrated London News, 28 October 1848. This confirms the issue date; the record does not independently confirm the page number 264, so that number is omitted from the new catalogue.
- [Bermuda, LOC 2001695531](https://www.loc.gov/item/2001695531/): find dated 22 January 1860; publication in Harper's Weekly, 3 March 1860, p. 132.
- Webber: the supplied scan record and imprint identify a 1785 printing. Its association with the 1784 first publication is separate from the reproduced print's date.
- Egede: sighting 1734; supplied reproduction attributed to Pontoppidan 1753. No new independent authentication of the reproduction's edition is claimed.
- Alecton: encounter 1861; supplied print dated 1865 after E. Rodolphe. Preserve both dates rather than silently dating the print to the encounter.
- Hunt–Lenox: retain conventional approximate c. 1510, not an exact manufacture year. Dating scholarship varies.

## Interpretations

The [Harvard constellation table](https://library.cfa.harvard.edu/iau-constellations) lists Draco and Hydra as ancient Greek/Ptolemaic. Their appearance in Hevelius's 1690 atlas represents a parallel astronomical tradition, not a migration of terrestrial dragons into the sky.

The unnamed horned head on Carta marina is only tentatively grouped with the sea-unicorn. That qualification is on the source plate and beside the catalogue entry. Historical animal names are not diagnostic modern identifications. Olaus's polypus, Montfort's colossal octopus and the photographed giant squid are grouped as related imagery, not a single species changing form.

The [Library of Congress discussion](https://blogs.loc.gov/maps/2016/08/imaginary-maps-in-literature-and-beyond-map-monsters/) supports the wider context: monsters could serve ornament and communicate knowledge, religious or political ideas. Avoid assuming each image marked unexplored water or represented a literal belief.

## Rebuild and provenance

The tracked `experiments-source/map-monsters/manifest.json` holds checksum and retrieval provenance for 25 source files. The old cache-only sidecars remain useful research history but are not required by the maintained workflow. Exact recovered URLs for Worm pp. 282/283 (`pagethumb/...3000,3000`) and Scoresby plate XII (`n602_w2000.jpg`) were downloaded and matched to the inherited bytes. The remaining URLs come from their inherited source sidecars; a fresh network fetch of all 25 was not performed.

`python3 execution/rebuild_map_monsters.py --fetch` downloads missing sources, rejects changed bytes, creates missing directories, rebuilds source plates, exports WebP and generates 31 annotated context images plus the 30-entry HTML catalogue. The context is the supplied scan; some upstream scans are already details. Repository links provide the route to the full work. Tests check crop coverage, caption agreement, valid downloads, checksum rejection, non-retry of permanent HTTP errors and bounded transient retries.

The inherited Plate VIII AI prompt is absent. `renders/provenance.json` records that gap instead of inventing a prompt. IX/X prompt files are preserved. Illustrated images retain legacy captions and are labelled as artistic interpretations before display; the corrected source plates and catalogue take precedence.
