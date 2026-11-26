import { useCallback, useState } from 'react';
import { MB, track } from '../tracker';

// The leaky version from the article: a new 10 MB object on every render,
// two memoized callbacks, and one function that calls both.
export function Editor() {
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);
  const pixels = track(new Uint8Array(10 * MB)); // 10 MB, new every render

  const handleA = useCallback(() => setCountA(countA + 1), [countA]);
  const handleB = useCallback(() => setCountB(countB + 1), [countB]);

  const handleBoth = () => {
    handleA();
    handleB();
    console.log(pixels.length);
  };

  return (
    <div className="buttons">
      <button id="a" onClick={handleA}>Increment A ({countA})</button>
      <button id="b" onClick={handleB}>Increment B ({countB})</button>
      <button id="both" onClick={handleBoth}>Both</button>
    </div>
  );
}
