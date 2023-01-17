const createScript = (src: string, onLoad: () => void) => {
  const script = document.createElement("script");
  script.src = src;
  document.body.appendChild(script);
  script.onload = onLoad;
};

export { createScript };
