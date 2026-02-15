import React from 'react';
import useQueryParams from './useQueryParams';
import Page from '../../components/Page';
import { Redirect } from 'react-router-dom';
import useFetchSong from './useFetchSong';
import Song from '../../components/Song';
import Field from '../../components/Field';
import Input from '../../components/Input';
import {
  ErrorNote,
  InputContainer,
  FormContainer,
  SubmitButtonContainer
} from './SubmitPage.styles';
import Text from '../../components/Text';
import useFocusOnMount from '../../hooks/useFocusOnMount';
import Button from '../../components/Button';
import useSubmitListenForm from './useSubmitListenForm';
import useSubmitListen from './useSubmitListen';
import { Link } from 'react-router-dom';
import { useGnomon } from '../../hooks/useSundial';
import useSubmittedAfterLastSunrise from '../../hooks/useSubmittedAfterLastSunrise';

export default function SubmitPage() {
  const queryParams = useQueryParams();
  const songId = isString(queryParams.id) ? queryParams.id : null;
  const [song, loading, error] = useFetchSong(songId);
  const focusOnMountProps = useFocusOnMount();
  const [
    name,
    note,
    setName,
    setNote,
    valid,
    invalidNameError,
    invalidNoteError
  ] = useSubmitListenForm();
  const [submit, submitError, submitLoading] = useSubmitListen();
  const [timeOfDay] = useGnomon();
  const submittedAfterLastSunrise = useSubmittedAfterLastSunrise();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(name, songId, note);
  }

  if (submittedAfterLastSunrise) return <Redirect to='/listens' />;
  if (timeOfDay !== 'day') return <Redirect to='/listens' />;
  if (!songId) return <Redirect to='/question' />;
  return (
    <Page>
      {error && (
        <span>
          <Text.Error>Error! {error}</Text.Error>
          <br />
          <br />
          Maybe go back to the{' '}
          <Link to='/question'>
            <Text.Success>Question Page</Text.Success>
          </Link>{' '}
          and select another song?
        </span>
      )}
      {loading && <div>loading..</div>}
      {submitError && <Text.Error>Error submitting listen!</Text.Error>}
      {submitLoading && <div>submitting...</div>}
      {song && (
        <form onSubmit={handleSubmit}>
          <FormContainer containerTitle='Submit Listen'>
            <Song song={song} />
            <Field.Block>
              <label>
                Your Name
                <InputContainer>
                  <Input.Text
                    data-test='name-input'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    mode={invalidNameError ? 'error' : undefined}
                    {...focusOnMountProps}
                  />
                </InputContainer>
              </label>
              {invalidNameError && <ErrorNote>{invalidNameError}</ErrorNote>}
            </Field.Block>
            <Field.Block>
              <label>
                Note <Text.Disabled>(Optional)</Text.Disabled>
                <InputContainer>
                  <Input.TextArea
                    data-test='note-input'
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    mode={invalidNoteError ? 'error' : undefined}
                  />
                </InputContainer>
              </label>
              {invalidNoteError && <ErrorNote>{invalidNoteError}</ErrorNote>}
            </Field.Block>
            <SubmitButtonContainer>
              <Button.Primary
                data-test='submit-button'
                disabled={!valid || submitLoading}
                type='submit'
              >
                Submit
              </Button.Primary>
            </SubmitButtonContainer>
          </FormContainer>
        </form>
      )}
    </Page>
  );
}

function isString(val: any): val is string {
  return typeof val === 'string';
}
