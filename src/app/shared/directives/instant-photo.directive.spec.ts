import { gsap } from 'gsap';
import { appendInstantPhotoCapture } from './instant-photo.directive';

/** Protect the pre-existing timeline's absolute capture timing during extraction. */
describe('Original instant photo capture', () => {
  it('keeps the shutter, blank hold, and development at their original times', () => {
    const photo = document.createElement('div');
    photo.innerHTML =
      '<img alt="Memory"><span class="snapshot-flash"></span><span class="snapshot-shutter"></span>';
    const timeline = gsap.timeline({ paused: true });
    appendInstantPhotoCapture(timeline, photo);
    const [shutter, development] = timeline.getChildren(false, true, false);
    expect(shutter.startTime()).toBe(0.46);
    expect(shutter.duration()).toBe(0.12);
    expect(development.startTime()).toBe(0.76);
    expect(development.duration()).toBe(0.95);
    const flash = photo.querySelector<HTMLElement>('.snapshot-flash')!;
    timeline.time(0.75);
    expect(Number(flash.style.opacity)).toBe(1);
    timeline.time(1.71);
    expect(Number(flash.style.opacity)).toBe(0);
    timeline.kill();
  });
});
