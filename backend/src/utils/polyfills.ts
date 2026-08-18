/**
 * Global polyfills that must be set up BEFORE any PDF.js usage
 * This module is imported first to ensure polyfills are in place
 * before PDF.js attempts its own initialization
 */

// Polyfill: DOMMatrix for advanced PDF rendering (SVG, transformations, etc.)
// Some PDFs use features that require DOMMatrix API which doesn't exist in Node.js
if (!(globalThis as any).DOMMatrix) {
  class DOMMatrix {
    // Standard 2D matrix properties (SVG/CSS notation)
    m11: number = 1;  // a: horizontal scaling
    m12: number = 0;  // b: vertical shearing
    m21: number = 0;  // c: horizontal shearing
    m22: number = 1;  // d: vertical scaling
    m41: number = 0;  // e: horizontal translation
    m42: number = 0;  // f: vertical translation

    // Alias properties for canvas 2D context notation
    get a(): number { return this.m11; }
    get b(): number { return this.m12; }
    get c(): number { return this.m21; }
    get d(): number { return this.m22; }
    get e(): number { return this.m41; }
    get f(): number { return this.m42; }

    set a(v: number) { this.m11 = v; }
    set b(v: number) { this.m12 = v; }
    set c(v: number) { this.m21 = v; }
    set d(v: number) { this.m22 = v; }
    set e(v: number) { this.m41 = v; }
    set f(v: number) { this.m42 = v; }

    // 3D properties (for full DOM spec compatibility)
    m13: number = 0;
    m14: number = 0;
    m23: number = 0;
    m24: number = 0;
    m31: number = 0;
    m32: number = 0;
    m33: number = 1;
    m34: number = 0;
    m43: number = 0;
    m44: number = 1;

    constructor(matrix?: string | number[]) {
      if (Array.isArray(matrix) && matrix.length >= 6) {
        [this.m11, this.m12, this.m21, this.m22, this.m41, this.m42] = matrix;
      }
    }

    multiply(other: DOMMatrix): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11 * other.m11 + this.m21 * other.m12;
      result.m12 = this.m12 * other.m11 + this.m22 * other.m12;
      result.m21 = this.m11 * other.m21 + this.m21 * other.m22;
      result.m22 = this.m12 * other.m21 + this.m22 * other.m22;
      result.m41 = this.m11 * other.m41 + this.m21 * other.m42 + this.m41;
      result.m42 = this.m12 * other.m41 + this.m22 * other.m42 + this.m42;
      return result;
    }

    translate(x: number, y: number): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11;
      result.m12 = this.m12;
      result.m21 = this.m21;
      result.m22 = this.m22;
      result.m41 = this.m41 + x;
      result.m42 = this.m42 + y;
      return result;
    }

    scale(x: number, y: number = x): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11 * x;
      result.m12 = this.m12 * x;
      result.m21 = this.m21 * y;
      result.m22 = this.m22 * y;
      result.m41 = this.m41;
      result.m42 = this.m42;
      return result;
    }

    rotate(angle: number): DOMMatrix {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const result = new DOMMatrix();
      result.m11 = this.m11 * cos + this.m21 * sin;
      result.m12 = this.m12 * cos + this.m22 * sin;
      result.m21 = this.m11 * -sin + this.m21 * cos;
      result.m22 = this.m12 * -sin + this.m22 * cos;
      result.m41 = this.m41;
      result.m42 = this.m42;
      return result;
    }

    inverse(): DOMMatrix {
      const det = this.m11 * this.m22 - this.m12 * this.m21;
      if (det === 0) throw new Error('Matrix is not invertible');
      const result = new DOMMatrix();
      result.m11 = this.m22 / det;
      result.m12 = -this.m12 / det;
      result.m21 = -this.m21 / det;
      result.m22 = this.m11 / det;
      result.m41 = (this.m21 * this.m42 - this.m22 * this.m41) / det;
      result.m42 = (this.m12 * this.m41 - this.m11 * this.m42) / det;
      return result;
    }

    toString(): string {
      return `matrix(${this.m11}, ${this.m12}, ${this.m21}, ${this.m22}, ${this.m41}, ${this.m42})`;
    }

    get isIdentity(): boolean {
      return this.m11 === 1 && this.m12 === 0 && this.m21 === 0 &&
             this.m22 === 1 && this.m41 === 0 && this.m42 === 0;
    }
  }

  // Assign to globalThis AND to window-like object if it exists
  (globalThis as any).DOMMatrix = DOMMatrix;
  if (typeof (globalThis as any).window !== 'undefined') {
    (globalThis as any).window.DOMMatrix = DOMMatrix;
  }
}

// Polyfill: DOMMatrix Read-only variant
if (!(globalThis as any).DOMMatrixReadOnly) {
  (globalThis as any).DOMMatrixReadOnly = (globalThis as any).DOMMatrix;
}

console.log(`✅ [polyfills] Core polyfills initialized (DOMMatrix, DOMMatrixReadOnly)`);
