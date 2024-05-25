import { create } from "zustand";

function numIslands(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const islands: Array<number[][]> = [];

  function dfs(row: number, col: number) {
    const stack: Array<[number, number]> = [[row, col]];
    const island: Array<[number, number]> = [];

    while (stack.length > 0) {
      const cell = stack.pop();
      if (cell) {
        const [r, c] = cell;

        if (r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || grid[r][c] === "0") {
          continue;
        }

        visited[r][c] = true;
        island.push([r, c]);

        // Push adjacent cells to the stack
        stack.push([r - 1, c]); // up
        stack.push([r + 1, c]); // down
        stack.push([r, c - 1]); // left
        stack.push([r, c + 1]); // right

        //Diagonal neighbors
        stack.push([r - 1, c - 1]); // up-left
        stack.push([r - 1, c + 1]); // up-right
        stack.push([r + 1, c - 1]); // down-left
        stack.push([r + 1, c + 1]); // down-right
      }
    }

    if (island.length > 0) {
      islands.push(island);
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === "1" && !visited[i][j]) {
        dfs(i, j);
      }
    }
  }

  return islands.length;
}

const defaultIsland: string[][] = Array.from({ length: 50 }, () => Array(100).fill("0"));

interface IslandStore {
  mapGrid: string[][];
  selectionMode: "select" | "drag";
  toggleCell: (row: number, col: number) => void;
  setSelectionMode: (mode: "select" | "drag") => void;
  numberOfIslandSelector: (state: IslandStore) => number;
}

export const useIslandStore = create<IslandStore>((set) => ({
  mapGrid: defaultIsland,
  selectionMode: "select",
  toggleCell: (row, col) =>
    set((state) => {
      const newGrid = state.mapGrid.map((r, rIdx) =>
        r.map((cell, cIdx) => {
          if (rIdx === row && cIdx === col) {
            return cell === "0" ? "1" : "0";
          }
          return cell;
        })
      );
      return { mapGrid: newGrid };
    }),
  setSelectionMode: (mode) => set({ selectionMode: mode }),
  numberOfIslandSelector: (state) => numIslands(state.mapGrid),
}));
