import { XY } from '@/data/types';
import { CW, CH } from '@/data/constants';

export function svgCoords(e: React.MouseEvent | React.TouchEvent, svg: SVGSVGElement): XY {
  const r = svg.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - r.left) / r.width * CW,
    y: (clientY - r.top) / r.height * CH,
  };
}
