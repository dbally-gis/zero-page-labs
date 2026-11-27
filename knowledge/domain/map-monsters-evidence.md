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

### Original-edition scan recovered — 2026-11-27

The Montfort cell now uses [Plate XXVI in the Smithsonian Libraries volume-II scan](https://archive.org/details/Histoirenaturel2Deny/page/n294/mode/1up), item `Histoirenaturel2Deny`, call number **39088008978892**. The [title page, reader index n4](https://archive.org/details/Histoirenaturel2Deny/page/n4/mode/1up) visibly states **PAR DENYS-MONTFORT; TOME SECOND; A PARIS; DE L’IMPRIMERIE DE F. DUFART; AN X**. The selected engraving visibly states **Pl. XXVI; T. 2. P. 256; LE POULPE COLOSSAL**. Those inscriptions, the complete institutional volume and its catalogue description identify the original French An X edition rather than an unattached later reproduction. The Smithsonian catalogue describes this copy's original orange paperboard binding and provenance from S. Stillman Berry via Clyde Roper.

The original title page and plate were both retrieved and visually inspected. The manifest stores their exact URLs, plate SHA-256 `ecfc9d5ceece34a151359db448413ab727dedb3500ca265a30dc63cf65c2f791`, title-page checksum and transcriptions. The date remains **An X (1801–1802)**: identification of the edition resolves the reproduction's provenance, not the exact Gregorian publication month.

Earlier source, now superseded: the [Commons reproduction](https://commons.wikimedia.org/wiki/File:Denys_de_Montfort_Poulpe_Colossal.jpg) carried an 1810 date, cited Ellis's 1994 book and contained archive-photo metadata. Its edition was not authenticated. That image is no longer a manifest input or the published source cell; the old local cached file may remain as research history.

Retrieval quirk: this Smithsonian scan's scandata starts `leafNum` at 1, while the reader's `n` index starts at 0. Thus title leaf 5 is reader n4, and plate leaf 295 is reader n294. Requests for n5/n295 return the reverse blank sheets, not the intended pages. Confirm the inscriptions visually; never transfer a leaf number into a reader URL without checking the indexing.

### Logy Bay: photographed 2 December 1873

The earlier c. 1873–74 bracket is superseded by Alexander Murray’s contemporary report, “Capture of a Gigantic Squid at Newfoundland,” The American Naturalist 8(2), February 1874, pp. 120–123. [Printed p. 122](https://archive.org/details/mobot31753002156542/page/n132/mode/1up) identifies two photographs of the November 1873 Logy Bay specimen (head and tentacles; body). [Printed p. 123](https://archive.org/details/mobot31753002156542/page/n133/mode/1up) explicitly dates the photographs to Tuesday, 2 December 1873 and credits Parsons and McKenna, St. John. Both scanned pages were visually checked against OCR. Preserve the spelling of the contemporary attribution rather than silently normalizing the second photographer’s name.

Moses Harvey’s retrospective “How I Discovered the Great Devil-Fish,” The Wide World Magazine 2 (1899), [printed p. 738](https://archive.org/details/wideworldmagazin02lond/page/738/mode/1up), describes transporting the head and arms in his sponge bath to photographic rooms and suspending them on a crossbar. Do not describe this as a photograph taken in his living room. The body was photographed separately. Verrill’s handwritten annotations are distinct from the exposure.

Use **photographed 2 December 1873**. February 1874 is the report’s publication date. Conflicting modern institutional captions no longer justify an uncertain exposure year; the reason those captions differ has not been established. The current digital image remains the annotated print supplied through Commons; the original negative or earliest print’s custody is not established by this research.

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
