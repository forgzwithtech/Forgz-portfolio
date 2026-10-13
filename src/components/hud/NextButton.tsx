import { useState } from 'react';
import { useIntro } from '../../state/IntroContext';
import { useFrame } from '../../state/StageContext';
import { useNextChapter } from '../../hooks/useNavigation';

export function NextButton() {
  const { ready } = useIntro();
  const [up, setUp] = useState(false);
  const next = useNextChapter();
  useFrame((y, tl) => setUp(y > tl.scenes.close[0] + tl.F * 0.7));
  return (
    <button className={`next${ready ? ' in' : ''}${up ? ' up' : ''}`} id="next" type="button" aria-label={up ? 'Back to the start' : 'Next'} onClick={next}>
      <svg viewBox="0 0 24 24">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
