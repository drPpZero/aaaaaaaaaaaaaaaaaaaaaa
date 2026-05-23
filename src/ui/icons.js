export function createPoseIcon(type, size = 80) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.classList.add("pose-icon");
  svg.innerHTML = getSvg(type);
  return svg;
}

function commonHead(cx = 50, cy = 18) {
  return `<circle cx="${cx}" cy="${cy}" r="6" fill="currentColor" />`;
}

function getSvg(type) {
  const stroke = `stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  switch (type) {
    case "loop":
      return `
        ${commonHead(50, 16)}
        <path ${stroke} d="M50 24 L47 42 L42 62 L36 86" />
        <path ${stroke} d="M48 38 L30 49" />
        <path ${stroke} d="M49 42 L66 54" />
        <path ${stroke} d="M42 62 L56 83" />
        <path ${stroke} d="M31 88 L42 86" />
      `;
    case "upright":
      return `
        ${commonHead(50, 14)}
        <path ${stroke} d="M50 22 L50 58" />
        <path ${stroke} d="M35 35 C46 30 55 30 66 35" />
        <path ${stroke} d="M50 58 L39 88" />
        <path ${stroke} d="M50 58 L61 88" />
        <path ${stroke} d="M34 88 L66 88" />
      `;
    case "spiral":
      return `
        ${commonHead(48, 16)}
        <path ${stroke} d="M48 24 L48 48" />
        <path ${stroke} d="M48 34 L18 26" />
        <path ${stroke} d="M48 34 L82 20" />
        <path ${stroke} d="M48 48 L42 86" />
        <path ${stroke} d="M50 48 L88 50" />
        <path ${stroke} d="M35 88 L50 86" />
      `;
    case "split":
      return `
        ${commonHead(50, 22)}
        <path ${stroke} d="M50 30 L50 52" />
        <path ${stroke} d="M50 38 L25 48" />
        <path ${stroke} d="M50 38 L75 48" />
        <path ${stroke} d="M50 52 L12 74" />
        <path ${stroke} d="M50 52 L88 74" />
        <path ${stroke} d="M8 76 L92 76" />
      `;
    case "sit":
      return `
        ${commonHead(50, 16)}
        <path ${stroke} d="M50 24 L46 48 L34 66" />
        <path ${stroke} d="M47 38 L25 46" />
        <path ${stroke} d="M48 40 L69 50" />
        <path ${stroke} d="M34 66 L74 72" />
        <path ${stroke} d="M33 66 L28 88" />
        <path ${stroke} d="M25 90 L38 88" />
      `;
    case "side":
    default:
      return `
        ${commonHead(50, 16)}
        <path ${stroke} d="M50 24 L50 56" />
        <path ${stroke} d="M50 34 L20 47" />
        <path ${stroke} d="M50 34 L80 47" />
        <path ${stroke} d="M50 56 L32 86" />
        <path ${stroke} d="M50 56 L68 86" />
        <path ${stroke} d="M26 88 L74 88" />
      `;
  }
}
