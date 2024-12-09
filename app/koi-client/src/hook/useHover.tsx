import React from 'react';

const useHover = <TElement extends HTMLElement>(elementRef: React.RefObject<TElement>): boolean => {
  const [isHovered, setHovered] = React.useState(false);

  // eslint-disable-next-line consistent-return
  React.useEffect(() => {
    const onMouseEnter = (): void => setHovered(true);
    const onMouseLeave = (): void => setHovered(false);

    if (elementRef.current) {
      const node = elementRef.current;
      node.addEventListener('mouseenter', onMouseEnter);
      node.addEventListener('mouseleave', onMouseLeave);
      return () => {
        node.removeEventListener('mouseenter', onMouseEnter);
        node.removeEventListener('mouseleave', onMouseLeave);
      };
    }
  }, [elementRef]);

  return isHovered;
};

export default useHover;
