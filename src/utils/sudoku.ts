export type SudokuPuzzle = {
  puzzle: string
  solution: string
}

const puzzles: SudokuPuzzle[] = [
  {
    puzzle: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
    solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
  },
  {
    puzzle: '300200000000107000706030500070009080900020004010800050009040301000702000000008006',
    solution: '351286497492157638786934512275469183938521764614873259829645371163792845547318926',
  },
  {
    puzzle: '000260701680070090190004500820100040004602900050003028009300074040050036703018000',
    solution: '435269781682571493197834562826195347374682915951743628519326874248957136763418259',
  },
]

export function getDailyPuzzle(date = new Date()): SudokuPuzzle {
  const daySeed = Math.floor(date.getTime() / 86400000)
  return puzzles[daySeed % puzzles.length]
}

export function toGrid(serialized: string) {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => Number(serialized[row * 9 + col]))
  )
}

export function isCellLocked(puzzle: string, row: number, col: number) {
  return puzzle[row * 9 + col] !== '0'
}

export function updateGridValue(grid: number[][], row: number, col: number, value: number) {
  return grid.map((gridRow, rowIndex) =>
    gridRow.map((cell, colIndex) => (rowIndex === row && colIndex === col ? value : cell))
  )
}

export function isSolved(grid: number[][], solution: string) {
  return grid.every((row, rowIndex) =>
    row.every((cell, colIndex) => String(cell) === solution[rowIndex * 9 + colIndex])
  )
}
