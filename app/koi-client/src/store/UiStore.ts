import { atom } from 'jotai/vanilla';
import { CSSProperties } from 'react';

export const backgroundColor = atom<CSSProperties['backgroundColor'] | undefined>(undefined);

export const padding = atom<CSSProperties['padding'] | undefined>(undefined);

export const isScrollView = atom<boolean>(true);
