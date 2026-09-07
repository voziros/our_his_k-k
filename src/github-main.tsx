import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/app/globals.css';
import { StoryExperience } from '@/components/story/story-experience';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoryExperience />
  </StrictMode>,
);
