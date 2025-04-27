import React, { useRef, useState, useEffect } from "react";

const useResizeObserver = (initWidth=0, initHeight=0) => {
  const containerRef = useRef(null);
  const [ size, setSize ] = useState({ width: initWidth, height: initHeight });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return [containerRef, size];
}
export default useResizeObserver;