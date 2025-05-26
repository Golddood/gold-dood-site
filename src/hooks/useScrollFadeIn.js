import { useEffect, useRef, useState } from 'react';

const useScrollFadeIn = () => {
  const dom = useRef();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (dom.current) observer.observe(dom.current);

    return () => observer.disconnect();
  }, []);

  return {
    ref: dom,
    className: `transition-all duration-700 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`,
  };
};

export default useScrollFadeIn;
