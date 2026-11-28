"""Assemble experiments/myth-or-record/floors.json from the researchers' batches.

Merges execution/myth_research/research_*.json, sorts floors by sortYear (the oubliette,
a story about many places, always goes last), renumbers 1..N and keeps only the
fields the page uses.

Usage:
    python3 execution/assemble_myth_floors.py [--allow-partial]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "execution" / "myth_research"  # the researchers' raw batches, kept as provenance
OUT = ROOT / "experiments" / "myth-or-record" / "floors.json"
FIELDS = ["floor", "id", "site", "short", "place", "lat", "lon", "years", "sortYear", "title", "claim", "verdict",
          "answer", "explanation", "nuance", "visual", "sources", "confidence"]
LAST = "oubliette"

# Editorial overrides applied on top of the researchers' text. They change voice and
# wording for readers (no first person, no notes about the research process), add
# short names for the floor gauge, and carry the review's corrections below. No
# verdict is changed.
SHORT = {
    "daliborka": "Daliborka, Prague", "nuremberg": "Nuremberg holes", "little-ease": "Tower of London",
    "iron-mask": "The Iron Mask", "newgate": "Newgate", "magdeburg": "Magdeburg",
    "black-hole-calcutta": "Black Hole, Calcutta", "piombi-casanova": "The Piombi, Venice",
    "mont-saint-michel-cage": "Mont-Saint-Michel", "iron-maiden-nuremberg": "The Iron Maiden",
    "oubliette": "The oubliette", "castel-sant-angelo": "Castel Sant'Angelo", "peter-paul": "Peter and Paul",
    "chateau-d-if": "Château d'If", "marshalsea": "Marshalsea", "pignerol": "Pignerol",
}
EDITS = {
    "carcassonne": {"nuance": "The Inquisition's prison at Carcassonne was in use from the 1200s, but its best-documented years are 1303–1320, so this floor is dated to them. Délicieux's judges waived his chains and bread-and-water diet because of his age and weak hands; Pope John XXII is reported to have overruled them. His trial began on 3 or 12 September 1319; sources differ. Lea's history dates from the 1880s but is still standard, and his description of the 'strict wall' covers inquisitorial prisons in general, not Carcassonne alone."},
    "loches": {"title": "Louis XI's cages", "nuance": "The verdict rests on the absence of evidence: nothing proves Balue was never caged, but no source from his lifetime says he was. Where he was held is also unclear; some accounts say Loches, others the château of Onzain near Blois. The cage shown at Loches today is a reconstruction. The cages' nickname, 'fillettes du roi' (the king's little girls), is traditional; it could not be confirmed in the sources checked for this page."},
    "nuremberg": {"nuance": "'Usually' matters: a few people may have stayed longer, but other towers, such as the debtors' tower, served as the city's regular prisons. Most of the sources are the City of Nuremberg's own museum and tourism pages. Bavaria abolished torture by decree in 1806; its new criminal code followed in 1813."},
    "cachtice": {"nuance": "This floor tests only the blood-bath story, not whether she was guilty, which historians still argue about. Szabelski, who argues she was the victim of a political plot, is cited only for where the legend came from. Her confinement is also disputed: the palatine Thurzó wrote that she was locked in a bricked-up room, but church visit records from July 1614 suggest she could move about the castle, so the claim avoids 'walled up alive'. Her arrest is dated 29 December, 30 December or New Year's Eve 1610."},
    "lancaster": {"nuance": "Tradition, repeated by the castle itself, says the accused were held in a dungeon below the Well Tower (also called the Witches' Tower). No document from 1612 names the cell, so the claim leaves the Well Tower out. The date of Demdike's death is not recorded. Potts's 1613 account is the original record of the trials, but its text could not be checked for this page, so it is not quoted or cited."},
    "black-hole-calcutta": {"nuance": "The verdict is on the 146 and 123 figures, not on whether the event happened. In 1915–16 J. H. Little called the whole story a 'gigantic hoax'; most later historians do not go that far. Estimates of the true numbers vary. The often-quoted 64 confined and 21 survivors is credited to Gupta by some writers and to Wolpert or Prior by others; the part of Gupta's article that is freely readable does not give the 64. Holwell gives the room as a cube of about 18 feet; other accounts give 14 by 18 feet."},
    "chateau-d-if": {"nuance": "That his father asked for the order comes from the French historian Roger Duchêne (Le château d'If et les îles, 1996), as cited by French Wikipedia. His stay is usually dated 1774–1775. The real priest José Custódio de Faria is said to have inspired Dumas, but none of the sources checked for this page shows he was ever held at If. The hole between the two 'show' cells was dug by a guard, and the Dantès cell is a reconstruction for tourists. Sources differ on when visitors were first shown it: 1844 or 1848."},
    "mont-saint-michel-cage": {"nuance": "The legend speaks of a cage of wood and iron, and it may well have had iron fittings; the myth is that it was an iron cage. Sources disagree on how it ended. The architect Corroyer says it was destroyed in 1777 during a visit by the Count of Artois. Louis-Philippe, who saw it as a boy, says only its door was taken off during his visit; the year of that visit is uncertain (the school anthology that reprints his account dates it to 1777, which seems too early, since he was born in 1773). The tale the monks told him, that a writer spent seventeen years in it for mocking Louis XIV, is not confirmed. The cage shown today is a reconstruction."},
    "iron-maiden-nuremberg": {"nuance": "The 1793 date is as reported by German Wikipedia, citing Der Spiegel (2022); the medievalist Peter Konieczny dates the story's first appearance to the end of the 18th century, in a Nuremberg guidebook by Siebenkees, and also gives the 1515 tale. German Wikipedia links Siebenkees's account to a 1533 chronicle entry, so he may have embroidered an older story rather than inventing one. The Nuremberg original was destroyed in Allied bombing in 1944 or 1945. An execution in 1515 would in any case be early modern rather than medieval. Because the legend dates from 1793, this floor comes after the Bastille."},
    "oubliette": {"nuance": "Viollet-le-Duc was more sceptic than promoter: his dictionary fixed the popular image, but of his three plausible cases he accepted only Pierrefonds without reservation. The word itself is medieval French; what came later was the belief that oubliettes were everywhere. Leap Castle's story of 'three cartloads of bones' is left out because it traces only to popular and tourist accounts, not to a documented find. Chris Bishop's 2019 study of the dungeon in popular imagination is behind a paywall; it is cited for its subject, not for a specific quotation."},
}

# Corrections from the independent review of 2026-11-27. Each is an exact find-and-replace
# on the researchers' text; the build fails if the text to replace is not found, so a
# correction can never silently stop applying.
REPLACE = {
    "black-hole-calcutta": [
        ("claim", "146 prisoners were crammed into Calcutta's 'Black Hole' and 123 of them suffocated, as survivor John Holwell reported.",
         "146 prisoners were crammed into Calcutta's 'Black Hole', and 123 of them suffocated."),
    ],
    "oubliette": [
        ("explanation", "He accepted only three, and suspected that one (Chinon) was a latrine and that the Bastille's was probably an ice store.",
         "He knew of only three cases that could reasonably be called oubliettes, and of those he thought Chinon's was probably a latrine and the Bastille's could pass for an ice store."),
    ],
    "lancaster": [
        ("claim", "Old Demdike, named as the ringleader of the Pendle witches,", "Old Demdike, one of the accused Pendle witches,"),
        ("explanation", "Thomas Potts, the court clerk, printed the official account in 1613 and names her as the ringleader.",
         "Thomas Potts, the court clerk, printed the official account of the trials in 1613."),
    ],
    "magdeburg": [
        ("claim", "spent almost ten years in Magdeburg's fortress, chained to the wall of his cell.",
         "spent almost ten years in Magdeburg's fortress, most of them chained to the wall of his cell."),
        ("nuance", "The 68-pound", "He was put in chains after his escape attempts, not on arrival, so the chaining covers most of his stay rather than all of it. The 68-pound"),
        ("nuance", "Sources disagree on the year of his arrest: Wikipedia says 1753, Penkert says 1754.", "Accounts give his arrest as 1753 or 1754; Penkert says 1754."),
    ],
    "newgate": [
        ("sources.url", "https://www.cambridge.org/core/product/C146C290D5B33736C5B86C92A01B83AD",
         "https://www.cambridge.org/core/journals/architectural-history/article/newgate-prison/AD6033D58F752DD8F5472DA86B6A508A"),
    ],
    "nuremberg": [
        ("explanation", "The sculptor Veit Stoss, held here for forgery, was branded rather than jailed.",
         "The sculptor Veit Stoss, the cells' most famous inmate, was held here for forgery and spared execution: he was branded instead."),
    ],
    "little-ease": [
        ("explanation", "Thornbury's 'Old and New London' says it was", "Thornbury's 'Old and New London', quoting an earlier writer, says it was"),
    ],
    "iron-maiden-nuremberg": [
        ("explanation", "Historians think he probably made the story up.", "Historians doubt it: no record of such an execution has been found, and he probably invented or embroidered the tale."),
    ],
    "st-andrews": [
        ("nuance", " Wikipedia places the dungeon under the north-west tower. HES and other sources place it in the Sea Tower, which is the north-west tower of the castle.",
         " The Sea Tower is the castle's north-west tower."),
    ],
    "chillon": [
        ("explanation", "Archaeologists have found no trace of a prisoner around the columns.",
         "Excavations found no sign of the path Bonivard said he wore into the rock floor."),
        ("nuance", " Bonivard's own claim to have worn a path into the rock floor is literary and unconfirmed.", ""),
    ],
}
DROP_SOURCES = {
    # Cited only for a visit date that the article itself marks 'citation needed'.
    "mont-saint-michel-cage": ["https://en.wikipedia.org/wiki/Louis_Philippe_I"],
}

# One plain sentence shown under the verdict. Written only from each floor's own
# (verified) explanation; the full explanation, fine print and sources sit below it.
ANSWERS = {
    "carcassonne": "He was sentenced in December 1319 to life in the Inquisition's prison he had fought, and died in early 1320.",
    "loches": "The cages existed, but no source from Balue's lifetime puts him in one; the Catholic Encyclopedia traces the story to 16th-century Italy.",
    "daliborka": "Dalibor was a real prisoner, but violins didn't reach Bohemia until about a century after his execution in 1498.",
    "chillon": "Bonivard spent about two years in rooms in the castle and four in the dungeon. The chained-to-a-pillar picture comes from Byron's poem.",
    "castel-sant-angelo": "Cellini's own memoir describes the linen rope and the broken leg, and other accounts confirm the escape and recapture.",
    "st-andrews": "Historic Environment Scotland says the murdered cardinal's body was certainly kept in the bottle dungeon, packed in salt.",
    "nuremberg": "The cells mostly held people awaiting trial or execution. Punishment was usually branding, flogging or death, not a long sentence.",
    "little-ease": "A priest was kept there for eighteen months from 1582, and Victorian historians describe it as too small to stand or lie in, though its exact place and size are uncertain.",
    "cachtice": "The 1611 witnesses accused her of torture and murder, but not blood baths. That story first appears in print around 1729.",
    "lancaster": "She died in Lancaster Castle while waiting for the August 1612 trials.",
    "pignerol": "Fouquet died at Pignerol in 1680. The masked prisoner died in the Bastille 23 years later.",
    "iron-mask": "The Bastille's own officer wrote down a black velvet mask. The iron came later, from legend and Voltaire.",
    "dunnottar": "About 167 men and women were held in one cellar for some two months in 1685.",
    "peter-paul": "Alexei died in the fortress on 26 June 1718 (Old Style), two days after his last flogging; exactly how is still debated.",
    "marshalsea": "The inquiry exposed terrible conditions, and Acton was tried for four murders, but he was acquitted every time.",
    "newgate": "Gaol fever from Newgate killed the Lord Mayor, two judges and many others at the 1750 sessions.",
    "magdeburg": "He was held for nearly ten years and chained to the wall after his escape attempts.",
    "black-hole-calcutta": "Many died that night, but the 146 and 123 come from one survivor's pamphlet, and historians think far fewer were inside.",
    "piombi-casanova": "Venice's own records punish the jailer for the escape and pay for repairing the hole they broke out through.",
    "chateau-d-if": "Mirabeau was held there for some months from 1774 on a royal order. Dantès and Faria are fiction.",
    "mont-saint-michel-cage": "Louis-Philippe, who saw it as a boy, remembered it as made of great pieces of wood, and the architect Corroyer, who studied the abbey, wrote in 1877 that it was wood.",
    "bastille": "Four forgers, two men judged mad and one count: seven prisoners in all.",
    "iron-maiden-nuremberg": "No medieval use is recorded. The story appears in the 1790s, and the cabinets shown were assembled in the 1800s.",
    "oubliette": "True forgetting pits were rare; many supposed oubliettes were really storerooms, latrines or ice stores.",
}


def apply_replacements(f: dict) -> None:
    for field, old, new in REPLACE.get(f["id"], []):
        if field == "sources.url":
            hits = [s for s in f["sources"] if s["url"] == old]
            if not hits:
                raise SystemExit(f"{f['id']}: source URL to replace not found")
            for s in hits:
                s["url"] = new
            continue
        if old not in f[field]:
            raise SystemExit(f"{f['id']}.{field}: text to replace not found: {old[:60]}")
        f[field] = f[field].replace(old, new)
    drop = DROP_SOURCES.get(f["id"], [])
    f["sources"] = [s for s in f["sources"] if s["url"] not in drop]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--allow-partial", action="store_true", help="write even if there are fewer than 24 floors")
    args = ap.parse_args()
    floors: list[dict] = []
    for path in sorted(SRC.glob("research_*.json")):
        floors += json.loads(path.read_text())
    ids = [f["id"] for f in floors]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        print(f"Duplicate ids: {sorted(dupes)}", file=sys.stderr)
        return 1
    if len(floors) != 24 and not args.allow_partial:
        print(f"Expected 24 floors, found {len(floors)}", file=sys.stderr)
        return 1
    floors.sort(key=lambda f: (f["id"] == LAST, f["sortYear"]))
    for n, f in enumerate(floors, 1):
        f["floor"] = n
        f["short"] = SHORT.get(f["id"], f["site"])
        apply_replacements(f)
        if f["id"] not in ANSWERS:
            raise SystemExit(f"{f['id']}: no one-line answer in ANSWERS")
        f["answer"] = ANSWERS[f["id"]]
        f.update(EDITS.get(f["id"], {}))
    clean = [{k: f.get(k, "") for k in FIELDS} for f in floors]
    OUT.write_text(json.dumps({"floors": clean}, ensure_ascii=False, indent=1) + "\n")
    myths = sum(f["verdict"] == "myth" for f in clean)
    print(json.dumps({"floors": len(clean), "myths": myths, "records": len(clean) - myths,
                      "order": [f"{f['floor']}:{f['id']}:{f['sortYear']}" for f in clean]}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
