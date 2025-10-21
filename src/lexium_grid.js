// Lexium Grid — písmenková mříž 6x6
export class LexiumGrid {
  constructor(size = 6) {
    this.size = size;
    this.grid = this.generateGrid();
  }

  generateGrid() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const grid = [];
    for (let y = 0; y < this.size; y++) {
      const row = [];
      for (let x = 0; x < this.size; x++) {
        const glyph = chars[Math.floor(Math.random() * chars.length)];
        row.push(glyph);
      }
      grid.push(row);
    }
    return grid;
  }

  draw(ctx, width, height) {
    const cellW = width / this.size;
    const cellH = height / this.size;
    ctx.font = `${Math.min(cellW, cellH) * 0.6}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const glyph = this.grid[y][x];
        const px = x * cellW + cellW / 2;
        const py = y * cellH + cellH / 2;
        ctx.fillText(glyph, px, py);
      }
    }
  }

  pulse() {
    // jemné "oživení" písmen při dechu
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (Math.random() < 0.1) {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          this.grid[y][x] = chars[Math.floor(Math.random() * chars.length)];
        }
      }
    }
  }
}
