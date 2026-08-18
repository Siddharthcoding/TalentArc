import { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { matchResumeToJD } from '@/services/api';

const initialState = {
  status: 'idle',
  file: null,
  jdText: '',
  jdFile: null,
  result: null,
  error: null,
  paywallError: null,
  progressStep: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'MATCHING':
      return {
        ...state,
        status: 'matching',
        file: action.payload.file,
        jdText: action.payload.jdText || '',
        jdFile: action.payload.jdFile || null,
        progressStep: 0,
        error: null,
        paywallError: null,
      };
    case 'SET_STEP':
      return { ...state, progressStep: action.payload };
    case 'COMPLETE':
      return { ...state, status: 'complete', result: action.payload, error: null, paywallError: null };
    case 'ERROR':
      return { ...state, status: 'error', error: action.payload, paywallError: null };
    case 'PAYWALL':
      return { ...state, status: 'idle', error: null, paywallError: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

const JdMatcherContext = createContext();

const STEP_MIN_DURATIONS = [1200, 1600, 1400];

export function JdMatcherProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stepTimers = useRef([]);
  const stepRef = useRef(state.progressStep);
  stepRef.current = state.progressStep;

  const clearTimers = useCallback(() => {
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
  }, []);

  const advanceStep = useCallback((target, onDone) => {
    const step = stepRef.current;
    if (step < target) {
      const delay = STEP_MIN_DURATIONS[step] || 1000;
      stepTimers.current.push(setTimeout(() => {
        dispatch({ type: 'SET_STEP', payload: step + 1 });
        advanceStep(target, onDone);
      }, delay));
    } else if (onDone) {
      onDone();
    }
  }, []);

  const startMatch = useCallback((file, jdText, jdFile) => {
    dispatch({ type: 'MATCHING', payload: { file, jdText, jdFile } });

    let completed = false;
    let resultData;

    const finish = () => {
      if (completed) return;
      completed = true;
      clearTimers();
      dispatch({ type: 'COMPLETE', payload: resultData });
    };

    matchResumeToJD(file, jdText, jdFile)
      .then((data) => {
        resultData = data;
        if (stepRef.current < 2) {
          advanceStep(2, () => {
            completed = true;
            clearTimers();
            setTimeout(() => dispatch({ type: 'COMPLETE', payload: data }), 300);
          });
        } else {
          finish();
        }
      })
      .catch((err) => {
        clearTimers();
        if (err?.code === 402) {
          dispatch({ type: 'PAYWALL', payload: err });
        } else {
          dispatch({ type: 'ERROR', payload: err });
        }
      });
  }, [advanceStep, clearTimers]);

  const retry = useCallback(() => {
    if (state.file) {
      startMatch(state.file, state.jdText, state.jdFile);
    }
  }, [state.file, state.jdText, state.jdFile, startMatch]);

  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: 'RESET' });
  }, [clearTimers]);

  const value = { ...state, startMatch, retry, reset, clearPaywall: () => dispatch({ type: 'RESET' }) };

  return (
    <JdMatcherContext.Provider value={value}>
      {children}
    </JdMatcherContext.Provider>
  );
}

export function useJdMatcher() {
  const context = useContext(JdMatcherContext);
  if (!context) throw new Error('useJdMatcher must be used within JdMatcherProvider');
  return context;
}