import { XY } from './types';

// ═══════════════════════════════════════════════════════════════
// Court Dimensions
// ═══════════════════════════════════════════════════════════════
export const CW = 540;
export const CH = 840;
export const NET_Y = 305;
export const ATK_LINE = 110;
export const PR = 21;  // player radius
export const BR = 9;   // ball radius

// ═══════════════════════════════════════════════════════════════
// Position Helper
// ═══════════════════════════════════════════════════════════════
export const xy = (x: number, y: number): XY => ({ x, y });

// ── Named player positions ──────────────────────────────────
// Front row (near net)
export const FR_L = xy(88, 342);
export const FR_M = xy(270, 342);
export const FR_R = xy(452, 342);
// Back row passing zones
export const BR_L = xy(95, 662);
export const BR_M = xy(270, 668);
export const BR_R = xy(448, 662);
// Mid coverage
export const MC_L = xy(105, 548);
export const MC_M = xy(270, 548);
export const MC_R = xy(435, 548);
// Deep coverage
export const DC_L = xy(95, 705);
export const DC_M = xy(270, 712);
export const DC_R = xy(445, 705);
// Attack approaches (players jumping at antenna)
export const NET_L = xy(82, 322);
export const NET_M = xy(270, 318);
export const NET_R = xy(458, 322);
// Setter target (zone 2 at net)
export const SET_TGT = xy(395, 318);
// Coverage behind 3m line
export const CVR_L = xy(108, 468);
export const CVR_M = xy(270, 462);
export const CVR_R = xy(432, 468);

// ── Ball positions ─────────────────────────────────────────
// Opponent side serves
export const SRV_L = xy(88, 22);
export const SRV_M = xy(270, 22);
export const SRV_R = xy(452, 22);
// Our side passer contacts (platform level)
export const PSS_L = xy(112, 650);
export const PSS_M = xy(270, 660);
export const PSS_R = xy(430, 650);
// Ball mid-rise (between passer and setter)
export const RISE = xy(362, 478);
// Setter contact — ball exactly at setter's hands
export const B_SET = xy(395, 318);
// Attack contacts — ball just above net at hitter's hands (y < NET_Y = 305)
export const BK_L = xy(82, 288);     // OH left antenna attack contact
export const BK_M = xy(270, 284);    // MB middle attack contact
export const BK_R = xy(458, 288);    // RS right antenna attack contact
export const BK_31 = xy(218, 286);   // 31 shoot contact zone 3
export const BK_SL = xy(440, 288);   // slide attack contact (right of setter)
export const BK_BC = xy(175, 288);   // BIC contact
export const BK_BP = xy(365, 288);   // BIP contact
export const BK_PP = xy(270, 294);   // pipe contact
// Ball on opponent side after attack
export const OVR_L = xy(82, 112);
export const OVR_M = xy(270, 108);
export const OVR_R = xy(458, 112);
export const OVR_XL = xy(448, 98);   // cross from left antenna
export const OVR_XR = xy(88, 98);    // cross from right antenna
// Defense: opponent attack contacts
export const OPP_ATK_L = xy(82, 175);
export const OPP_ATK_M = xy(270, 172);
export const OPP_ATK_R = xy(458, 175);
// Block contacts (just above our net)
export const BLK_L = xy(82, 295);
export const BLK_M = xy(270, 292);
export const BLK_R = xy(458, 295);
// Dig contacts (our back court)
export const DIG_L = xy(112, 568);
export const DIG_M = xy(270, 572);
export const DIG_R = xy(428, 568);
