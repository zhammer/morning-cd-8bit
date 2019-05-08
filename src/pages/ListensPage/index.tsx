import React, { useMemo } from 'react';
import Page from '../../components/Page';
import Title from '../../components/Title';
import Listen from './Listen';
import useFetchListens from './useFetchListens';
import List from '../../components/List';
import { useGnomon } from '../../hooks/useSundial';
import usePrevious from '../../hooks/usePrevious';
import { Redirect } from 'react-router';
import VisibilitySensor from 'react-visibility-sensor';
import { LoadingMore } from './ListenPage.styles';

export default function ListensPage() {
  const { listens, loading, fetchMore, hasMore, loadingMore } = useFetchListens();
  const [timeOfDay] = useGnomon();
  const previousTimeOfDay = usePrevious(timeOfDay);
  const sunHasRisen = useMemo<boolean>(() => {
    return timeOfDay === 'day' && previousTimeOfDay === 'beforeSunrise';
  }, [timeOfDay, previousTimeOfDay]);

  if (sunHasRisen) return <Redirect to='/question' />;
  return (
    <Page>
      <Title>
        Here are the first pieces of music people listened to today, from all over the world.
      </Title>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <List>
            {listens.reverse().map(listen => (
              <Listen key={listen.id} listen={listen} />
            ))}
          </List>
          {hasMore && (
            <VisibilitySensor onChange={isVisible => isVisible && fetchMore()}>
              <LoadingMore active={loadingMore}>Loading more...</LoadingMore>
            </VisibilitySensor>
          )}
        </>
      )}
    </Page>
  );
}
