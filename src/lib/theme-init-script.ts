import { DEFAULT_ACCENT } from "@/constant/accents";
import { ACCENT_KEY, buildAccentInitMap } from "@/lib/accent";
import { THEME_KEY } from "@/lib/theme";

const accentMap = buildAccentInitMap();
const accentKeys = ["--indigo", "--indigo-light", "--indigo-glow"];

export const THEME_INIT_SCRIPT = `(function(){var p=window.location.pathname;var t=(p==='/'||p==='')?'light':(localStorage.getItem('${THEME_KEY}')||'dark');document.documentElement.setAttribute('data-theme',t);var a=localStorage.getItem('${ACCENT_KEY}')||localStorage.getItem('lbot_enterprise_accent')||'${DEFAULT_ACCENT}';var m=${JSON.stringify(accentMap)};var c=m[a]||m['${DEFAULT_ACCENT}'];var keys=${JSON.stringify(accentKeys)};for(var i=0;i<keys.length;i++){document.documentElement.style.setProperty(keys[i],c[i]);}document.documentElement.setAttribute('data-accent',a);})();`;
