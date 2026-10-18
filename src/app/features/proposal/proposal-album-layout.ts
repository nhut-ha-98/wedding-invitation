/** Border-box geometry before transforms; the slot is the card's offset parent. */
export interface StackBounds {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly slotWidth: number;
}

export interface StackPose {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
}

/** Fits the rotated paper itself inside its slot, without clipping or scaling it. */
export function fitStackPose(bounds: StackBounds, desired: StackPose): StackPose {
  const { width, height, left, slotWidth } = bounds;
  if (width <= 0 || height <= 0 || slotWidth <= 0) return desired;
  const projectedWidth = (angle: number): number => {
    const radians = (Math.abs(angle) * Math.PI) / 180;
    return width * Math.cos(radians) + height * Math.sin(radians);
  };
  // Leave one pixel at each edge for fractional layout and transform rounding.
  const availableWidth = slotWidth - 2;
  let rotation = desired.rotation;
  if (projectedWidth(rotation) > availableWidth) {
    let low = 0;
    let high = Math.abs(rotation);
    for (let step = 0; step < 24; step++) {
      const middle = (low + high) / 2;
      if (projectedWidth(middle) <= availableWidth) low = middle;
      else high = middle;
    }
    rotation = Math.sign(rotation) * low;
  }
  const halfWidth = projectedWidth(rotation) / 2;
  const center = left + width / 2;
  const minimumX = halfWidth + 1 - center;
  const maximumX = slotWidth - 1 - center - halfWidth;
  return {
    ...desired,
    rotation,
    x: Math.max(minimumX, Math.min(maximumX, desired.x)),
  };
}
