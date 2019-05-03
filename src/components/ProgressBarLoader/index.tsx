import React, { useState, useEffect, useRef } from 'react';
import { ZeroToOneHundred } from '../ProgressBar/types';
import ProgressBar from '../ProgressBar';

export default function ProgressBarLoader() {
  const [value, setValue] = useState<ZeroToOneHundred>(0);
  const intervalRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setValue(value => (value < 100 ? value + 2 : value) as ZeroToOneHundred);
    }, 10);
  }, []);
  useEffect(() => {
    if (value === 100) {
      clearInterval(intervalRef.current);
    }
  }, [value]);

  return <ProgressBar data-test='progress-bar-loader' value={value} />;
}
