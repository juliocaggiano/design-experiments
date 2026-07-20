/* Type declarations for the vendored liquidPath.js, adapted from the upstream
   index.d.ts (MIT). The custom-element class and global augmentations are
   dropped — the vault consumes only the LiquidPath math API. */

export type LiquidMode = 'merged' | 'detached'
export type LiquidPhase = 'contained' | 'neck' | 'detached'

export interface PeelParameters {
  detachGap?: number
  transition?: number
  couplingRadius?: number
  pull?: number
}

export interface NormalizedPeelParameters {
  readonly detachGap: number
  readonly transition: number
  readonly couplingRadius: number
  readonly pull: number
  readonly peelStart: number
}

export interface LiquidDebugGeometry {
  topology: LiquidMode
  phase: LiquidPhase
  actualD: string
  outputD: string
  inputD: string
  contactZoneD: string
  contactBandD: string
  waistD: string
  conceptualGap: number
  contactKind: 'none' | 'touch' | 'bridge' | 'overlap'
  overlap: number
  separation: number
  seamY: number | null
  waistWidth: number
}

export interface LiquidFrame {
  d: string
  edgeD: string
  debug: LiquidDebugGeometry | null
  mode: LiquidMode
  phase: LiquidPhase
  gap: number
  peelParameters: NormalizedPeelParameters
  faceGap: number
  inputBottom: number
  inputContentHeight: number
  inputContentScaleY: number
  inputContentY: number
  inputFaceRx: number
  inputFaceRy: number
  inputHeight: number
  inputY: number
  inputVisualHeight: number
  inputVisualY: number
  notch: number
  outputHeight: number
  outputFaceRx: number
  outputFaceRy: number
  outputOpacity: number
  outputBlur: number
  outputScaleY: number
  outputSmear: number
  outputY: number
  sendArrowScaleY: number
  sendHeight: number
  sendOffsetY: number
  sendRadiusY: number
  sendScaleY: number
  seamY: number | null
  strain: number
  stretch: number
  waistWidth: number
}

export interface LiquidFrameOptions {
  mode?: LiquidMode
  peelParameters?: PeelParameters | NormalizedPeelParameters
  tearAge?: number
  tearStrength?: number
  closeAge?: number
  openAge?: number
  openStrength?: number
  scrub?: boolean
  debug?: boolean
}

export interface MeasuredTransition {
  done: boolean
  gap: number
  velocity: number
}

export interface LiquidPathAPI {
  readonly DEFAULT_PEEL_PARAMETERS: Readonly<Required<PeelParameters>>
  readonly PEEL_PARAMETER_LIMITS: Readonly<
    Record<keyof Required<PeelParameters>, Readonly<{ min: number; max: number }>>
  >
  readonly LIQUID_GEOMETRY: Readonly<Record<string, number>>
  readonly LIQUID_MOTION: Readonly<Record<string, number>>
  readonly LIQUID_TRANSITIONS: Readonly<
    Record<'opening' | 'closing', readonly Readonly<{ t: number; gap: number }>[]>
  >
  clamp(value: number, min: number, max: number): number
  closeAgeForGap(gap: number): number
  createLiquidFrame(
    gap: number,
    velocity?: number,
    options?: LiquidFrameOptions,
  ): LiquidFrame
  easedPeelAge(elapsed: number): number
  finiteNumber(value: unknown, fallback?: number): number
  normalizePeelParameters(parameters?: PeelParameters): NormalizedPeelParameters
  openingContentPull(gap: number, velocity: number): number
  openingTension(velocity: number): number
  resolveLiquidMode(
    previousMode: LiquidMode | undefined,
    gap: number,
    velocity?: number,
    peelParameters?: PeelParameters | NormalizedPeelParameters,
  ): LiquidMode
  resolveScrubMode(
    previousMode: LiquidMode | undefined,
    gap: number,
    peelParameters?: PeelParameters | NormalizedPeelParameters,
  ): LiquidMode
  sampleClosePose(age: number): Readonly<Record<string, number>>
  sampleMeasuredTransition(
    kind: 'opening' | 'closing',
    age: number,
    hiddenGap?: number,
    restGap?: number,
  ): MeasuredTransition
  samplePeelCorrection(age: number): Readonly<Record<string, number>>
  smoothstep(edge0: number, edge1: number, value: number): number
  smootherstep(edge0: number, edge1: number, value: number): number
}

export declare const LiquidPath: LiquidPathAPI
