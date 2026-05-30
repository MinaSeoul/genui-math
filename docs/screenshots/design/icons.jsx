/* ============================================================
   Solvio — 라인 아이콘 세트 (간결한 stroke SVG)
   ============================================================ */
const Icon = ({ name, size = 20, stroke = 2, style }) => {
  const P = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    upload: <g {...P}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" /></g>,
    image: <g {...P}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m4 17 4.5-4.5 3 3L15 12l5 5" /></g>,
    check: <g {...P}><path d="m4 12 5 5L20 6" /></g>,
    help: <g {...P}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" /><path d="M12 16.5h.01" /></g>,
    compass: <g {...P}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></g>,
    flag: <g {...P}><path d="M5 21V4" /><path d="M5 4h11l-2 3 2 3H5" /></g>,
    eye: <g {...P}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="2.6" /></g>,
    arrow: <g {...P}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></g>,
    arrowL: <g {...P}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></g>,
    spark: <g {...P}><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m6 6 2.5 2.5" /><path d="m15.5 15.5 2.5 2.5" /><path d="m18 6-2.5 2.5" /><path d="m8.5 15.5-2.5 2.5" /></g>,
    func: <g {...P}><path d="M4 19c4 0 3-14 7-14" /><path d="M3 12h7" /><path d="M14 9.5 20 15" /><path d="M20 9.5 14 15" /></g>,
    graph: <g {...P}><path d="M4 4v16h16" /><path d="M7 15c2-6 4-9 5-9s2 4 5 9" /></g>,
    motion: <g {...P}><circle cx="6" cy="12" r="2.5" /><path d="M10 12h5" /><path d="m12 9 3 3-3 3" /><path d="M19 6v12" /></g>,
    refresh: <g {...P}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></g>,
    send: <g {...P}><path d="M5 12 20 4l-4 16-4.5-6.5z" /><path d="M11.5 13.5 20 4" /></g>,
    play: <g {...P}><path d="M7 5.5 18 12 7 18.5z" fill="currentColor" stroke="none" /></g>,
    pause: <g {...P}><rect x="7" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="13.6" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" /></g>,
    lock: <g {...P}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
    bolt: <g {...P}><path d="M13 3 4 14h6l-1 7 9-11h-6z" /></g>,
    bulb: <g {...P}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3Z" /></g>,
    info: <g {...P}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></g>,
    target: <g {...P}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></g>,
    x: <g {...P}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></g>,
    layers: <g {...P}><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></g>,
    chat: <g {...P}><path d="M4 5h16v11H9l-4 3v-3H4z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></g>,
    file: <g {...P}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></g>,
    ruler: <g {...P}><path d="M3 8h18v8H3z" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></g>,
    drop: <g {...P}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></g>,
    wave: <g {...P}><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
};

window.Icon = Icon;
