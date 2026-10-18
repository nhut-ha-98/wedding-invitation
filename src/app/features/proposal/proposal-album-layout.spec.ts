import { fitStackPose, StackBounds } from './proposal-album-layout';

function horizontalEdges(bounds: StackBounds, x: number, rotation: number): [number, number] {
  const radians = (Math.abs(rotation) * Math.PI) / 180;
  const halfWidth = (bounds.width * Math.cos(radians) + bounds.height * Math.sin(radians)) / 2;
  const center = bounds.left + bounds.width / 2 + x;
  return [center - halfWidth, center + halfWidth];
}

describe('Album stack bounds', () => {
  it.each([120, 180, 260, 300])(
    'keeps paper inside a %i pixel slot for drops, rests, and pops',
    (slotWidth) => {
      for (const height of [180, 360, 1200]) {
        const bounds = { slotWidth, width: slotWidth - 40, height, left: 20 };
        for (const rotation of [-8, -3, 4, 8, 14]) {
          for (const x of [0, 8, 38]) {
            const pose = fitStackPose(bounds, { x, y: -8, rotation });
            const [left, right] = horizontalEdges(bounds, pose.x, pose.rotation);
            expect(left).toBeGreaterThanOrEqual(0.999999);
            expect(right).toBeLessThanOrEqual(slotWidth - 0.999999);
            expect(pose.y).toBe(-8);
          }
        }
      }
    },
  );

  it('preserves the intended pose when the paper already fits', () => {
    const desired = { x: 8, y: -8, rotation: 3 };
    expect(fitStackPose({ width: 200, height: 240, left: 50, slotWidth: 300 }, desired)).toEqual(
      desired,
    );
  });
});
