import React from 'react';
import useQueryParams from './useQueryParams';
import Page from '../../components/Page';
import { Redirect } from 'react-router';
import useFetchSong from './useFetchSong';
import Song from '../../components/Song';
import Field from '../../components/Field';
import Input from '../../components/Input';
import { InputContainer, FormContainer, SubmitButtonContainer } from './SubmitPage.styles';
import Text from '../../components/Text';
import useFocusOnMount from '../../hooks/useFocusOnMount';
import Button from '../../components/Button';
import useSubmitListenForm from './useSubmitListenForm';
import useSubmitListen from './useSubmitListen';
import useSubmitStateMachine from './useSubmitStateMachine';

export default function SubmitPage() {
  const queryParams = useQueryParams();
  const songId = isString(queryParams.id) ? queryParams.id : null;
  const [song, loading, error] = useFetchSong(songId);
  const focusOnMountProps = useFocusOnMount();
  const [name, note, setName, setNote, valid] = useSubmitListenForm();
  const [submit] = useSubmitListen();
  const [submitState, sendSubmitStateEvent] = useSubmitStateMachine();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!songId) return;
    sendSubmitStateEvent('SUBMIT');
    try {
      await submit(name, songId, note);
    } catch (e) {
      sendSubmitStateEvent('ERROR');
    }
    sendSubmitStateEvent('SUCCESS');
  }

  if (!songId) return <Redirect to='/question' />;
  if (submitState === 'success') return <Redirect push to='/listens' />;
  return (
    <Page>
      {error && <div>{error}</div>}
      {loading && <div>loading..</div>}
      {submitState === 'error' && <div>error...</div>}
      {submitState === 'submitting' && <div>submitting...</div>}
      {song && (
        <form onSubmit={handleSubmit}>
          <FormContainer containerTitle='Submit Listen'>
            <Song song={song} />
            <Field.Block>
              <label>
                Your Name
                <InputContainer>
                  <Input.Text
                    value={name}
                    onChange={e => setName(e.target.value)}
                    {...focusOnMountProps}
                  />
                </InputContainer>
              </label>
            </Field.Block>
            <Field.Block>
              <label>
                Note <Text.Disabled>(Optional)</Text.Disabled>
                <InputContainer>
                  <Input.TextArea value={note} onChange={e => setNote(e.target.value)} />
                </InputContainer>
              </label>
            </Field.Block>
            <SubmitButtonContainer>
              <Button.Primary disabled={!valid} type='submit'>
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