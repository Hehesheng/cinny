import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

export type RenderMode = 'html' | 'markdown' | 'raw_body';

type RenderModeMap = Map<string, RenderMode>;

const renderModeAtom = atom<RenderModeMap>(new Map());

export const useRenderMode = (eventId: string) => {
  const modeMap = useAtomValue(renderModeAtom);
  return modeMap.get(eventId) ?? 'markdown';
};

export const useSetRenderMode = () => {
  const setModeMap = useSetAtom(renderModeAtom);

  const setRenderMode = useCallback(
    (eventId: string, mode: RenderMode) => {
      setModeMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(eventId, mode);
        return newMap;
      });
    },
    [setModeMap]
  );

  return setRenderMode;
};
