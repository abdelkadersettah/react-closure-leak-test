import { useCallback, useRef, useState } from 'react';
import { MB, track } from '../tracker';

// Fix 1 from the article: create the big object once and keep it in a ref.
export function EditorFixed() {
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);
  const pixelsRef = useRef<Uint8Array | null>(null);
  if (!pixelsRef.current) pixelsRef.current = track(new Uint8Array(10 * MB));

  const handleA = useCallback(() => setCountA(countA + 1), [countA]);
  const handleB = useCallback(() => setCountB(countB + 1), [countB]);

  const handleBoth = () => {
    handleA();
    handleB();
    console.log(pixelsRef.current?.length);
  };

  return (
    <div className="buttons">
      <button id="a" onClick={handleA}>Increment A ({countA})</button>
      <button id="b" onClick={handleB}>Increment B ({countB})</button>
      <button id="both" onClick={handleBoth}>Both</button>
    </div>
  );
}
