/**
 * Polyfill para DOMMatrix en Node.js
 * Necesario para que pdf-parse funcione en el servidor
 */

if (typeof globalThis.DOMMatrix === 'undefined') {
  // Polyfill simple para DOMMatrix
  globalThis.DOMMatrix = class DOMMatrix {
    a: number = 1
    b: number = 0
    c: number = 0
    d: number = 1
    e: number = 0
    f: number = 0

    constructor(init?: string | number[]) {
      if (init) {
        if (typeof init === 'string') {
          // Parsear string de transformación
          const values = init.match(/[\d.]+/g)?.map(Number) || []
          if (values.length >= 6) {
            this.a = values[0]
            this.b = values[1]
            this.c = values[2]
            this.d = values[3]
            this.e = values[4]
            this.f = values[5]
          }
        } else if (Array.isArray(init)) {
          if (init.length >= 6) {
            this.a = init[0]
            this.b = init[1]
            this.c = init[2]
            this.d = init[3]
            this.e = init[4]
            this.f = init[5]
          }
        }
      }
    }

    multiply(other: DOMMatrix): DOMMatrix {
      const result = new DOMMatrix()
      result.a = this.a * other.a + this.c * other.b
      result.b = this.b * other.a + this.d * other.b
      result.c = this.a * other.c + this.c * other.d
      result.d = this.b * other.c + this.d * other.d
      result.e = this.a * other.e + this.c * other.f + this.e
      result.f = this.b * other.e + this.d * other.f + this.f
      return result
    }

    translate(x: number, y: number): DOMMatrix {
      const result = new DOMMatrix()
      result.a = this.a
      result.b = this.b
      result.c = this.c
      result.d = this.d
      result.e = this.e + x
      result.f = this.f + y
      return result
    }

    scale(x: number, y?: number): DOMMatrix {
      const scaleY = y !== undefined ? y : x
      const result = new DOMMatrix()
      result.a = this.a * x
      result.b = this.b * x
      result.c = this.c * scaleY
      result.d = this.d * scaleY
      result.e = this.e
      result.f = this.f
      return result
    }
  } as any
}

