import { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { analyzeResume } from '@/services/api';

const STEP_MIN_DURATIONS = [1200, 1500, 1000];
const STEP_LABELS = ['Extracting text...', 'Running ATS checks...', 'Compiling score...'];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const initialState = {
  status: 'idle',
  file: null,
  result: null,
  error: null,
  progressStep: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, file: action.payload, status: 'idle', error: null, result: null };
    case 'UPLOADING':
      return { ...state, status: 'uploading', progressStep: 0, error: null };
    case 'SET_STEP':
      return { ...state, progressStep: action.payload };
    case 'ANALYZING':
      return { ...state, status: 'analyzing' };
    case 'COMPLETE':
      return { ...state, status: 'complete', result: action.payload, error: null };
    case 'ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: { title: 'File Too Large', message: 'Maximum file size is 10 MB.' } };
  }
  return { valid: true };
}

const ResumeContext = createContext();

export function ResumeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stepTimers = useRef([]);

  const clearTimers = useCallback(() => {
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
  }, []);

  const stepRef = useRef(state.progressStep);
  stepRef.current = state.progressStep;

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

  const selectFile = useCallback((file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      dispatch({ type: 'ERROR', payload: validation.error });
      return;
    }
    dispatch({ type: 'SET_FILE', payload: file });
    dispatch({ type: 'UPLOADING' });

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      clearTimers();
      dispatch({ type: 'ANALYZING' });
      dispatch({ type: 'SET_STEP', payload: 2 });
      setTimeout(() => {
        dispatch({ type: 'COMPLETE', payload: resultData });
      }, STEP_MIN_DURATIONS[2]);
    };

    let resultData;

    analyzeResume(file)
      .then((data) => {
        resultData = data;
        dispatch({ type: 'ANALYZING' });
        if (stepRef.current < 2) {
          advanceStep(2, () => {
            completed = true;
            clearTimers();
            setTimeout(() => {
              dispatch({ type: 'COMPLETE', payload: data });
            }, 300);
          });
        } else {
          finish();
        }
      })
      .catch((err) => {
        clearTimers();
        dispatch({ type: 'ERROR', payload: err });
      });
  }, [advanceStep, clearTimers]);

  const retry = useCallback(() => {
    if (state.file) {
      dispatch({ type: 'UPLOADING' });
      selectFile(state.file);
    }
  }, [state.file, selectFile]);

  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: 'RESET' });
  }, [clearTimers]);

  const value = {
    ...state,
    selectFile,
    retry,
    reset,
    stepLabels: STEP_LABELS,
    stepMinDurations: STEP_MIN_DURATIONS,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) throw new Error('useResume must be used within ResumeProvider');
  return context;
}
