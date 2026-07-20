# Asset Manifest & Visual Component Inventory
## Global AI Career Assessment Platform

> **Document Status**: Production WebP Asset Inventory
> **Version**: 1.0.0

---

## 1. Overview & Scope

This manifest defines the visual WebP assets required for the **Global AI Career Assessment Platform**. As per system specifications:
- **Excluded**: Application logos, header branding, and general marketing assets.
- **Included**:
  1. The **6 RIASEC Landing Page Dimension Assets** (`docs/global_platform/assets/riasec/riasec_*.webp`).
  2. The **6 Character Archetype Artworks** displayed at the end of the assessment on the results dashboard (`docs/global_platform/assets/riasec/archetype_*.webp`).
  3. The **60 Question Option WebP Assets** (`docs/global_platform/assets/riasec/questions/q*_*.webp`) mapped directly to each binary choice across all 30 questions.

All files are stored as optimized, high-resolution WebP images in [docs/global_platform/assets/riasec/](assets/riasec/).

---

## 2. RIASEC Landing Page Dimension Assets

Displayed on the landing page interactive carousel and introductory dimension cards:

| Dimension Code | Holland Name | WebP Asset File Path | Visual Theme / Description |
| :---: | :--- | :--- | :--- |
| **`R`** | Realistic | [riasec_r.webp](assets/riasec/riasec_r.webp) | Red / Crimson theme: Hands-on tools, hardware, outdoors |
| **`I`** | Investigative | [riasec_i.webp](assets/riasec/riasec_i.webp) | Blue theme: Science laboratory, research data, curiosity |
| **`A`** | Artistic | [riasec_a.webp](assets/riasec/riasec_a.webp) | Purple theme: Digital artwork, creative design, palette |
| **`S`** | Social | [riasec_s.webp](assets/riasec/riasec_s.webp) | Green theme: Mentorship, community support, collaboration |
| **`E`** | Enterprising | [riasec_e.webp](assets/riasec/riasec_e.webp) | Orange theme: Public speaking, leadership, startup pitch |
| **`C`** | Conventional | [riasec_c.webp](assets/riasec/riasec_c.webp) | Teal / Gray theme: Data management, systematic order, finance |

---

## 3. Assessment End Character Archetype Artworks

Displayed on the final AI Results Dashboard hero frame based on the candidate's primary and secondary Holland combination:

| Archetype Title | Target RIASEC Pair | WebP Asset File Path | Archetype Profile |
| :--- | :---: | :--- | :--- |
| **The Pathfinder** | `R` + `I` | [archetype_pathfinder.webp](assets/riasec/archetype_pathfinder.webp) | Technical explorer, robotics, engineering investigator |
| **The Creator** | `A` + `S` | [archetype_creator.webp](assets/riasec/archetype_creator.webp) | Expressive storyteller, UI/UX, human-centered designer |
| **The Strategist** | `E` + `C` | [archetype_strategist.webp](assets/riasec/archetype_strategist.webp) | Business development, startup founder, operations director |
| **The Visionary** | `I` + `A` | [archetype_visionary.webp](assets/riasec/archetype_visionary.webp) | AI researcher, game developer, innovative data scientist |
| **The Builder** | `R` + `C` | [archetype_builder.webp](assets/riasec/archetype_builder.webp) | Systems architect, civil engineer, practical technician |
| **The Guardian** | `S` + `E` | [archetype_guardian.webp](assets/riasec/archetype_guardian.webp) | Global advocate, healthcare director, community leader |

---

## 4. Question Item WebP Asset Mapping (30 Binary Questions / 60 Images)

Directory Location: `docs/global_platform/assets/riasec/questions/`

| Q# | Option A Text (Code) | Option A WebP Asset | Option B Text (Code) | Option B WebP Asset |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Assembling a toy robot (`R`) | `q01_a.webp` | Comparing two phones before buying (`I`) | `q01_b.webp` |
| **02** | Drawing a poster for a program (`A`) | `q02_a.webp` | Helping a classmate with homework (`S`) | `q02_b.webp` |
| **03** | Calling out snack deals at fair (`E`) | `q03_a.webp` | Tracking who paid and owes money (`C`) | `q03_b.webp` |
| **04** | Installing screen film without bubbles (`R`) | `q04_a.webp` | Checking if a viral tip works (`I`) | `q04_b.webp` |
| **05** | Writing a short story for fun (`A`) | `q05_a.webp` | Listening when a friend is upset (`S`) | `q05_b.webp` |
| **06** | Making a video to promote a club (`E`) | `q06_a.webp` | Sorting names on a class list (`C`) | `q06_b.webp` |
| **07** | Repairing a bike slipping gears (`R`) | `q07_a.webp` | Tracing why a wall socket fails (`I`) | `q07_b.webp` |
| **08** | Designing a T-shirt for class (`A`) | `q08_a.webp` | Showing younger kids a sport (`S`) | `q08_b.webp` |
| **09** | Convincing friends to join booth (`E`) | `q09_a.webp` | Marking paid vs unpaid on list (`C`) | `q09_b.webp` |
| **10** | Putting up a DIY shelf from kit (`R`) | `q10_a.webp` | Noticing tiny plant details on hike (`I`) | `q10_b.webp` |
| **11** | Making a party playlist (`A`) | `q11_a.webp` | Handing out flyers at health fair (`S`) | `q11_b.webp` |
| **12** | Leading group presentation (`E`) | `q12_a.webp` | Checking name spelling on form (`C`) | `q12_b.webp` |
| **13** | Tightening desk fan screws (`R`) | `q13_a.webp` | Testing if phone hack works (`I`) | `q13_b.webp` |
| **14** | Showing sibling how to use app (`S`) | `q14_a.webp` | Decorating bulletin board (`A`) | `q14_b.webp` |
| **15** | Running snack booth at fair (`E`) | `q15_a.webp` | Making sure money adds up (`C`) | `q15_b.webp` |
| **16** | Setting up chairs/tents for event (`R`) | `q16_a.webp` | Describing bird calls in park (`I`) | `q16_b.webp` |
| **17** | Welcoming new students (`S`) | `q17_a.webp` | Painting a school mural (`A`) | `q17_b.webp` |
| **18** | Planning group project tasks (`E`) | `q18_a.webp` | Sorting documents so none lost (`C`) | `q18_b.webp` |
| **19** | Fixing wobbly chair screws (`R`) | `q19_a.webp` | Reading how soap kills germs (`I`) | `q19_b.webp` |
| **20** | Guiding new student on campus (`S`) | `q20_a.webp` | Drawing pictures for handout (`A`) | `q20_b.webp` |
| **21** | Tracking fast-selling snacks (`I`) | `q21_a.webp` | Tallying quiz scores accurately (`C`) | `q21_b.webp` |
| **22** | Talking people into joining booth (`E`) | `q22_a.webp` | Double-checking checklist (`C`) | `q22_b.webp` |
| **23** | Building basic robot car kit (`R`) | `q23_a.webp` | Reading plant science magazine (`I`) | `q23_b.webp` |
| **24** | Sitting with classmate left out (`S`) | `q24_a.webp` | Designing accessible play zone (`A`) | `q24_b.webp` |
| **25** | Timing how long bubbles last (`I`) | `q25_a.webp` | Updating class attendance sheet (`C`) | `q25_b.webp` |
| **26** | Fixing a loose wooden stool (`R`) | `q26_a.webp` | Sorting recyclables into bins (`C`) | `q26_b.webp` |
| **27** | Drawing together with friends (`S`) | `q27_a.webp` | Designing a school club logo (`A`) | `q27_b.webp` |
| **28** | Pitching project idea to class (`E`) | `q28_a.webp` | Figuring out why phone game lags (`I`) | `q28_b.webp` |
| **29** | Carrying supply boxes for event (`R`) | `q29_a.webp` | Planting vegetables in garden (`S`) | `q29_b.webp` |
| **30** | Leading a debate on class topic (`E`) | `q30_a.webp` | Writing step-by-step club rules (`C`) | `q30_b.webp` |
