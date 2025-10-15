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
