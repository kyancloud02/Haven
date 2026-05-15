/**
 * SpriteParser — smart spritesheet normalizer.
 *
 * Loads any spritesheet URL, optionally removes a solid/near-white background,
 * auto-detects actual content row & column boundaries by pixel scanning,
 * then repacks every frame into a clean uniform grid on an OffscreenCanvas.
 *
 * Usage:
 *   const parser = new SpriteParser({ cols: 8, rows: 7 })
 *   const { canvas, frameW, frameH } = await parser.parse(url)
 *
 * The returned canvas can be used directly as a drawImage source.
 */

export class SpriteParser {
  /**
   * @param {object} opts
   * @param {number} opts.cols           Expected columns in the sheet (default 8)
   * @param {number} opts.rows           Expected rows in the sheet (default 7)
   * @param {boolean} opts.removeBg      Strip near-white/near-solid background (default true)
   * @param {number} opts.bgThreshold    RGB threshold for background removal (default 235)
   * @param {number} opts.minRowGap      Min px gap between rows before a boundary is detected (default 2)
   * @param {number} opts.minColGap      Min px gap between cols before a boundary is detected (default 2)
   * @param {number} opts.scanAlpha      Alpha threshold — pixel counts as "content" if alpha >= this (default 20)
   */
  constructor(opts = {}) {
    this.cols         = opts.cols         ?? 8
    this.rows         = opts.rows         ?? 7
    this.removeBg     = opts.removeBg     ?? true
    this.bgThreshold  = opts.bgThreshold  ?? 235
    this.minRowGap    = opts.minRowGap    ?? 2
    this.minColGap    = opts.minColGap    ?? 2
    this.scanAlpha    = opts.scanAlpha    ?? 20
  }

  /**
   * Load, process, and repack the spritesheet.
   * @param {string} url
   * @returns {Promise<{ canvas: OffscreenCanvas|HTMLCanvasElement, frameW: number, frameH: number }>}
   */
  async parse(url) {
    const img = await this._loadImage(url)

    // Draw source onto a working canvas so we can read pixels
    const src = this._makeCanvas(img.naturalWidth, img.naturalHeight)
    const sctx = src.getContext('2d')
    sctx.drawImage(img, 0, 0)

    if (this.removeBg) {
      this._removeBackground(sctx, img.naturalWidth, img.naturalHeight)
    }

    // Detect actual content boundaries
    const rowBounds = this._detectRows(sctx, img.naturalWidth, img.naturalHeight)
    const colBounds = this._detectCols(sctx, img.naturalWidth, img.naturalHeight)

    // Clamp to expected grid size
    const rows = Math.min(rowBounds.length, this.rows)
    const cols = Math.min(colBounds.length, this.cols)

    // Compute uniform frame size from average content dimensions
    const avgH = Math.round(rowBounds.slice(0, rows).reduce((s, b) => s + (b.end - b.start), 0) / rows)
    const avgW = Math.round(colBounds.slice(0, cols).reduce((s, b) => s + (b.end - b.start), 0) / cols)

    const frameW = Math.max(avgW, 1)
    const frameH = Math.max(avgH, 1)

    // Repack into a clean cols × rows grid
    const dst = this._makeCanvas(frameW * this.cols, frameH * this.rows)
    const dctx = dst.getContext('2d')

    for (let r = 0; r < rows; r++) {
      const rb = rowBounds[r]
      for (let c = 0; c < cols; c++) {
        const cb = colBounds[c]
        dctx.drawImage(
          src,
          cb.start, rb.start,          // src x, y
          cb.end - cb.start,           // src w
          rb.end - rb.start,           // src h
          c * frameW, r * frameH,      // dst x, y
          frameW, frameH,              // dst w, h (stretch/shrink to uniform)
        )
      }
    }

    return { canvas: dst, frameW, frameH }
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  _loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload  = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  _makeCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(w, h)
    }
    const c = document.createElement('canvas')
    c.width  = w
    c.height = h
    return c
  }

  /** Replace near-white pixels with transparent. */
  _removeBackground(ctx, w, h) {
    const data = ctx.getImageData(0, 0, w, h)
    const px   = data.data
    const t    = this.bgThreshold
    for (let i = 0; i < px.length; i += 4) {
      if (px[i] > t && px[i+1] > t && px[i+2] > t) {
        px[i+3] = 0
      }
    }
    ctx.putImageData(data, 0, 0)
  }

  /**
   * Scan horizontal bands to find row content boundaries.
   * A row of pixels is "empty" if all pixels in that row have alpha < scanAlpha.
   * Returns [{start, end}] for each detected content band.
   */
  _detectRows(ctx, w, h) {
    const data = ctx.getImageData(0, 0, w, h).data
    const alpha = this.scanAlpha

    const hasContent = new Uint8Array(h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] >= alpha) {
          hasContent[y] = 1
          break
        }
      }
    }

    return this._bandsToBounds(hasContent, h, this.minRowGap)
  }

  /**
   * Scan vertical bands to find column content boundaries.
   */
  _detectCols(ctx, w, h) {
    const data = ctx.getImageData(0, 0, w, h).data
    const alpha = this.scanAlpha

    const hasContent = new Uint8Array(w)
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        if (data[(y * w + x) * 4 + 3] >= alpha) {
          hasContent[x] = 1
          break
        }
      }
    }

    return this._bandsToBounds(hasContent, w, this.minColGap)
  }

  /**
   * Convert a binary content array into [{start, end}] bands,
   * merging gaps smaller than minGap.
   */
  _bandsToBounds(hasContent, len, minGap) {
    // Fill small gaps so thin inter-frame gaps don't split a band
    const filled = Uint8Array.from(hasContent)
    for (let i = 1; i < len - 1; i++) {
      if (!filled[i]) {
        let gap = 0
        let j = i
        while (j < len && !filled[j]) { gap++; j++ }
        if (gap <= minGap) {
          for (let k = i; k < j; k++) filled[k] = 1
        }
      }
    }

    const bands = []
    let inBand = false
    let start  = 0
    for (let i = 0; i <= len; i++) {
      if (!inBand && filled[i]) {
        inBand = true; start = i
      } else if (inBand && !filled[i]) {
        inBand = false; bands.push({ start, end: i })
      }
    }
    return bands
  }
}

/**
 * Convenience: parse a URL and convert the result to a data-URL string
 * suitable for use with HTMLImageElement or as a cache value.
 */
export async function parseSpriteSheetToDataUrl(url, opts = {}) {
  const parser = new SpriteParser(opts)
  const { canvas, frameW, frameH } = await parser.parse(url)

  let dataUrl
  if (canvas instanceof OffscreenCanvas) {
    const blob = await canvas.convertToBlob({ type: 'image/png' })
    dataUrl = await new Promise(res => {
      const fr = new FileReader()
      fr.onload = () => res(fr.result)
      fr.readAsDataURL(blob)
    })
  } else {
    dataUrl = canvas.toDataURL('image/png')
  }

  return { dataUrl, frameW, frameH }
}
