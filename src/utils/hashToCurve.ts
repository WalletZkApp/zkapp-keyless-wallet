import { CTX } from 'amcl-js';
import { asciitobytes } from './encoding';

// Refactored from miracl-core
const ctx: any = new CTX('SECP256K1');
const ro = 'QUUX-V01-CS02-with-secp256k1_XMD:SHA-256_SSWU_RO_';
const hlen = ctx.ECP.HASH_TYPE;

function ceil(a: number, b: number): number {
  return Math.floor((a - 1) / b + 1);
}

function hashToField(
  ctx: any,
  hash: any,
  hlen: number,
  DST: number[],
  M: number[],
  ctr: number
): any[] {
  const u: any[] = [];
  const q = new ctx.BIG(0);
  q.rcopy(ctx.ROM_FIELD.Modulus);
  const k = q.nbits();
  const r = new ctx.BIG(0);
  r.rcopy(ctx.ROM_CURVE.CURVE_Order);
  const m = r.nbits();
  const L = ceil(k + ceil(m, 2), 8);
  const OKM = ctx.HMAC.XMD_Expand(hash, hlen, L * ctr, DST, M);
  const fd: number[] = [];
  for (let i = 0; i < ctr; i++) {
    for (let j = 0; j < L; j++) fd[j] = OKM[i * L + j];
    const dx = ctx.DBIG.fromBytes(fd);
    const w = new ctx.FP(dx.mod(q));
    u[i] = new ctx.FP(w);
  }
  return u;
}

function hashToPairing(ctx: any, M: number[], ro: string, hlen: number): any {
  const DSTRO = asciitobytes(ro);
  const u = hashToField(ctx, ctx.HMAC.MC_SHA2, hlen, DSTRO, M, 2);
  const P = ctx.ECP.map2point(u[0]);
  const P1 = ctx.ECP.map2point(u[1]);
  P.add(P1);
  P.cfp();
  P.affine();
  return P;
}

export default function hashToCurve(bytes: number[]): any {
  return hashToPairing(ctx, bytes, ro, hlen);
}
