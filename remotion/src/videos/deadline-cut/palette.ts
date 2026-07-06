export const P = {
  paper: '#f8f4ec',
  paper2: '#efe7da',
  porcelain: '#fbfaf6',
  ink: '#2c2924',
  ink2: '#5c554a',
  muted: '#8f8779',
  line: '#d8cfc0',
  clay: '#c98b70',
  claySoft: '#ead1c1',
  sage: '#9aa78f',
  sageSoft: '#dce4d7',
  brass: '#b99a5f',
  brassSoft: '#eadfbe',
  oxide: '#a86659',
  slate: '#8da0a6',
  mist: '#e5e2dc',
};

export const alpha = (hex: string, value: number) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${value})`;
};
