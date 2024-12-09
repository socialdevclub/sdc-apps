import { Suspense } from 'react';
import { useAtomValue } from 'jotai';
import MobileLayout from '../../component-presentation/MobileLayout';
import PartyHeader from './component/MainHeader';
import Selector from './component/Selector';
import { UiStore } from '../../store';
import EmptyProvider from '../../component-presentation/EmptyProvider';

export default function Party() {
  const backgroundColor = useAtomValue(UiStore.backgroundColor);
  const padding = useAtomValue(UiStore.padding);
  const isScrollView = useAtomValue(UiStore.isScrollView);

  return (
    <MobileLayout
      backgroundColor={backgroundColor}
      padding={padding}
      ScrollViewComponent={isScrollView ? undefined : EmptyProvider}
      HeaderComponent={
        <Suspense fallback={<></>}>
          <PartyHeader />
        </Suspense>
      }
    >
      <Suspense>
        <Selector />
      </Suspense>
    </MobileLayout>
  );
}
