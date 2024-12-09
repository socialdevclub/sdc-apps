import 'dayjs/locale/ko';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export * from './stock.module';
