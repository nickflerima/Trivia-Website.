# Trivia Arcade

A modern, accessible trivia game powered by the Open Trivia Database.

## Play locally

```bash
cd /Users/nickflerima/Websites/my-website
python3 -m http.server 8080
# visit http://localhost:8080
```

## Features

- Setup screen: category, difficulty, number of questions, type
- Live scoring and progress HUD
- Multiple choice and True/False
- Result screen with play-again
- Dark/light themes, responsive layout

## Notes

- Questions are fetched from `https://opentdb.com/api.php`.
- Categories are loaded from `https://opentdb.com/api_category.php`.

## Pokémon category (local)

- Choose "Pokémon (Local)" in Category to play built‑in questions.
- Questions live at `data/pokemon.json` — edit or add more.
- Filters (difficulty/type) and amount apply to the local set.

## Pokémon Generation Filter

- When you select "Pokémon (Local)", a Generation dropdown appears.
- You can filter questions by Gen I–IX or leave Any.
- Edit or extend questions with a "generation" field in data/pokemon.json.
