# Sweeper Hormuz ⚓

A Minesweeper variant where the map is shaped like the **Persian Gulf and Strait of Hormuz**.

The playable area is a 40×15 grid with water cells forming a geographically inspired outline of the Gulf — from the narrow head near Kuwait/Iraq in the west, through the wide central body, narrowing at the famous Strait of Hormuz, and opening into the Gulf of Oman to the east.

## How to Play

- **Left-click** a water cell to reveal it
- **Right-click** to place or remove a mine marker (flag)
- Numbers show how many naval mines are in adjacent cells
- Clicking a 0-cell flood-fills all connected open water
- **Win:** reveal all water cells that are not mines
- **Lose:** click on a mine

## Difficulty

| Level  | Mines | Density |
|--------|-------|---------|
| Easy   | 30    | ~9%     |
| Medium | 60    | ~18%    |
| Hard   | 90    | ~27%    |

Your first click is always safe — mines are placed after you click.

## Running Locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Running in GitHub Codespaces

1. Open this repo in GitHub Codespaces
2. The dev container starts automatically and runs a Python HTTP server on port 8080
3. A browser tab opens automatically to the game

## Project Structure

```
sweeper-hormuz/
├── .devcontainer/
│   └── devcontainer.json   # Codespaces config
├── index.html              # Game markup
├── style.css               # Dark nautical theme
└── game.js                 # All game logic
```

No build tools, no npm, no dependencies.
