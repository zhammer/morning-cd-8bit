import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import SuperMarioBlockMachine from './machine';
import Icon from '../../../components/Icon';
import {
  BrickBlock,
  Coin,
  CoinContainer,
  Container,
  DoneBlock,
  FireFlowerContainer
} from './SuperMarioBlock.styles';

export default function SuperMarioBlock() {
  const [current, send] = useMachine(SuperMarioBlockMachine, { devTools: true });
  const [bumping, setBumping] = useState(false);
  function handleClick() {
    if (!bumping) {
      send('BUMP');
      setBumping(true);
      setTimeout(() => setBumping(false), 250);
    }
  }
  return (
    <Container data-easter='🥚' onClick={handleClick} onMouseDown={e => e.preventDefault()}>
      {(current.matches('idle') ||
        current.matches('active') ||
        current.matches('failed.hasntBumpedAfterFail')) && <BrickBlock bumping={bumping} />}
      {(current.matches('succeeded') || current.matches('failed.hasBumpedAfterFail')) && (
        <DoneBlock />
      )}
      {range(current.context.coins).map(index => (
        <CoinContainer key={index}>
          <Coin />
        </CoinContainer>
      ))}
      <a href='https://github.com/zhammer/morning-cd-8bit/pull/37' target='_blank'>
        <FireFlowerContainer activated={current.matches('succeeded')}>
          <Icon.FireFlower.a />
          <Icon.FireFlower.b />
          <Icon.FireFlower.c />
          <Icon.FireFlower.d />
        </FireFlowerContainer>
      </a>
    </Container>
  );
}

function range(count: number) {
  return [...Array(count).keys()];
}
