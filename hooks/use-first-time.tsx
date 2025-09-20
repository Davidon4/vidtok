import { useStorageState } from '@/services/storage';

const IS_FIRST_TIME = 'IS_FIRST_TIME';

export const useFirstTime = () => {
  const [[isLoading, isFirstTime], setIsFirstTime] = useStorageState(IS_FIRST_TIME);
  
  // If loading or no value stored, treat as first time
  if (isLoading || isFirstTime === null) {
    return [true, (value: boolean) => setIsFirstTime(value.toString())] as const;
  }
  
  return [isFirstTime === 'true', (value: boolean) => setIsFirstTime(value.toString())] as const;
};
