import AsyncStorage from '@react-native-async-storage/async-storage';

import { NoopAlarmScheduler } from '../alarm/NoopAlarmScheduler';
import { createAppStore } from './appStore';

/** アプリ本体で使うストア。端末内(AsyncStorage)に保存し、MVPではアラームを鳴らさない */
export const useAppStore = createAppStore(AsyncStorage, new NoopAlarmScheduler());
