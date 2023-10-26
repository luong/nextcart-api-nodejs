import '@/config/boostrap';
import express, { Application } from 'express';
import cors from 'cors';
import apiRoutes from '@/routes/api';
import ErrorMiddleware from '@/middleware/error-middleware';

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));
app.use(express.static('public'));

app.use('/', apiRoutes);
app.all('*', ErrorMiddleware.pageNotFound);
app.use(ErrorMiddleware.catchErrors);

export default app;