import React from 'react';
import Input from '../../components/Input';
import Page from '../../components/Page';
import Title from '../../components/Title';
import { QuestionContainer } from './QuestionPage.styles';
import useQuestionInput from './useQuestionInput';
import useSpotifySearch from './useSpotifySearch';
import Song from '../../components/Song';
import useConfidentInput from '../../hooks/useConfidentInput';
import { Redirect } from 'react-router-dom';
import useFocusOnMount from '../../hooks/useFocusOnMount';
import { useGnomon } from '../../hooks/useSundial';
import useSubmittedAfterLastSunrise from '../../hooks/useSubmittedAfterLastSunrise';
import List from '../../components/List';
import Styleless from '../../components/Styleless';

export default function QuestionPage() {
  const [questionInput, setQuestionInput] = useQuestionInput();
  const [confidentQuestionInput, forceConfident] = useConfidentInput(questionInput, 250);
  const [songs, loading] = useSpotifySearch(confidentQuestionInput);
  const focusOnMountProps = useFocusOnMount();
  const [timeOfDay] = useGnomon();
  const submittedListenAfterLastSunrise = useSubmittedAfterLastSunrise();

  if (submittedListenAfterLastSunrise) return <Redirect to='/listens' />;
  if (timeOfDay !== 'day') return <Redirect to='/listens' />;
  return (
    <Page data-test='question-page'>
      <Title>What was the first piece of music you listened to this morning?</Title>
      <QuestionContainer>
        <Input.Text
          data-test='question-input'
          aria-label='question-input'
          value={questionInput}
          onChange={e => setQuestionInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && forceConfident()}
          {...focusOnMountProps}
        />
      </QuestionContainer>
      {loading && <div>Loading...</div>}
      {songs && (
        <List data-test='songs-container'>
          {songs.map(song => (
            <Styleless.Link to={`/submit?id=${song.id}`} key={song.id}>
              <Song song={song} />
            </Styleless.Link>
          ))}
        </List>
      )}
    </Page>
  );
}
