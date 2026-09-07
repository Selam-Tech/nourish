# Food Composition Data

Place authoritative food composition datasets here for import.

## Expected Sources

- **Ethiopian Food Composition Table (EFCT)** — primary source for Ethiopia deployment
- FAO/INFOODS regional composition tables for global extension

## Required Fields Per Food

| Field | Description |
|-------|-------------|
| `canonicalId` | Stable identifier (e.g. `efct-teff-white`) |
| `nameEn` | English name |
| `nameAm` | Amharic name (when available) |
| `foodGroup` | Food group/category |
| `defaultUnit` | Default measurement unit (g, kg, piece) |

## Required Provenance

Every record must include:

- `sourceName` — e.g. "Ethiopian Food Composition Table"
- `sourceUrl` — reference URL if available
- `publicationVersion` — version/year
- `importedAt` — ISO date of import
- `unit` — unit for nutrient values (typically per 100g)

## Import

Do NOT invent nutrient values. Only import verified datasets.

```bash
# Future import command
npx tsx data/foods/import.ts --file your-dataset.csv --source "EFCT 2019"
```
