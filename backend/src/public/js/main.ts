import './modules/components/flash-messages';

/**
 * This script will be used for all pages
 */

/* Force screen zoom to 100% - otherwise cell input form will flash when selecting the first few rows */
// https://stackoverflow.com/questions/1713771/how-to-detect-page-zoom-level-in-all-modern-browsers/5078596#5078596
const scale: string = 'scale(1)';
document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
//document.body.style.msTransform     =   scale;   // IE 9 :: sw getting a TS error saying this doesn't exist
document.body.style.transform = scale;     // General
document.body.style.zoom = '1'; // 100%