/**
 * Global polyfills that must be set up BEFORE any PDF.js usage
 * This module is imported first to ensure polyfills are in place
 * before PDF.js attempts its own initialization
 */

// Ensure DOMMatrix exists before anything else tries to use it
if (!(globalThis as any).DOMMatrix) {
  class DOMMatrix {
    m11: number = 1;
    m12: number = 0;
    m21: number = 0;
    m22: number = 1;
    m41: number = 0;
    m42: number = 0;
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

    constructor(matrix?: string | number[]) {
      if (Array.isArray(matrix)) {
        if (matrix.length >= 6) {
          this.m11 = matrix[0] ?? 1;
          this.m12 = matrix[1] ?? 0;
          this.m21 = matrix[2] ?? 0;
          this.m22 = matrix[3] ?? 1;
          this.m41 = matrix[4] ?? 0;
          this.m42 = matrix[5] ?? 0;
          if (matrix.length >= 16) {
            this.m13 = matrix[6] ?? 0;
            this.m14 = matrix[7] ?? 0;
            this.m23 = matrix[8] ?? 0;
            this.m24 = matrix[9] ?? 0;
            this.m31 = matrix[10] ?? 0;
            this.m32 = matrix[11] ?? 0;
            this.m33 = matrix[12] ?? 1;
            this.m34 = matrix[13] ?? 0;
            this.m43 = matrix[14] ?? 0;
            this.m44 = matrix[15] ?? 1;
          }
        }
      }
    }

    multiply(other: any): DOMMatrix {
      if (!other) return this;
      const m11 = this.m11 * (other.m11 !== undefined ? other.m11 : 1) + this.m21 * (other.m12 !== undefined ? other.m12 : 0);
      const m12 = this.m12 * (other.m11 !== undefined ? other.m11 : 1) + this.m22 * (other.m12 !== undefined ? other.m12 : 0);
      const m21 = this.m11 * (other.m21 !== undefined ? other.m21 : 0) + this.m21 * (other.m22 !== undefined ? other.m22 : 1);
      const m22 = this.m12 * (other.m21 !== undefined ? other.m21 : 0) + this.m22 * (other.m22 !== undefined ? other.m22 : 1);
      const m41 = this.m11 * (other.m41 !== undefined ? other.m41 : 0) + this.m21 * (other.m42 !== undefined ? other.m42 : 0) + this.m41;
      const m42 = this.m12 * (other.m41 !== undefined ? other.m41 : 0) + this.m22 * (other.m42 !== undefined ? other.m42 : 0) + this.m42;
      return new DOMMatrix([m11, m12, m21, m22, m41, m42]);
    }

    translate(x?: number, y?: number): DOMMatrix {
      return new DOMMatrix([this.m11, this.m12, this.m21, this.m22, this.m41 + (x || 0), this.m42 + (y || 0)]);
    }

    scale(x?: number, y?: number): DOMMatrix {
      const sx = x !== undefined ? x : 1;
      const sy = y !== undefined ? y : sx;
      return new DOMMatrix([this.m11 * sx, this.m12 * sx, this.m21 * sy, this.m22 * sy, this.m41, this.m42]);
    }

    rotate(angle?: number): DOMMatrix {
      if (angle === undefined || angle === 0) return this;
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const m11 = this.m11 * cos + this.m21 * sin;
      const m12 = this.m12 * cos + this.m22 * sin;
      const m21 = this.m11 * -sin + this.m21 * cos;
      const m22 = this.m12 * -sin + this.m22 * cos;
      return new DOMMatrix([m11, m12, m21, m22, this.m41, this.m42]);
    }

    inverse(): DOMMatrix {
      const det = this.m11 * this.m22 - this.m12 * this.m21;
      if (det === 0) return new DOMMatrix([1, 0, 0, 1, 0, 0]);
      return new DOMMatrix([
        this.m22 / det, -this.m12 / det, -this.m21 / det, this.m11 / det,
        (this.m21 * this.m42 - this.m22 * this.m41) / det, (this.m12 * this.m41 - this.m11 * this.m42) / det
      ]);
    }

    toString(): string {
      return `matrix(${this.m11}, ${this.m12}, ${this.m21}, ${this.m22}, ${this.m41}, ${this.m42})`;
    }

    get isIdentity(): boolean {
      return this.m11 === 1 && this.m12 === 0 && this.m21 === 0 && this.m22 === 1 && this.m41 === 0 && this.m42 === 0;
    }
  }

  // Assign to all possible global references with proper descriptors
  Object.defineProperty(globalThis, 'DOMMatrix', {
    value: DOMMatrix,
    writable: true,
    enumerable: false,
    configurable: true
  });

  if (typeof global !== 'undefined' && global !== globalThis) {
    Object.defineProperty(global, 'DOMMatrix', {
      value: DOMMatrix,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }

  if (typeof (globalThis as any).window !== 'undefined') {
    (globalThis as any).window.DOMMatrix = DOMMatrix;
  }
}

// Polyfill: DOMMatrix Read-only variant
if (!(globalThis as any).DOMMatrixReadOnly) {
  (globalThis as any).DOMMatrixReadOnly = (globalThis as any).DOMMatrix;
}

console.log(`✅ [polyfills] Core polyfills initialized (DOMMatrix, DOMMatrixReadOnly)`);
