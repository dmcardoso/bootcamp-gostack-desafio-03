import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

// import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import OrderController from './app/controllers/OrderController';
import WithdrawController from './app/controllers/WithdrawController';

import authMiddleware from './app/middlewares/auth';

const upload = multer(multerConfig);

const routes = new Router();

// routes.post('/users', UserController.store);
// routes.put('/users', UserController.update);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/deliveryman', DeliverymanController.index);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

routes.get('/delivery', DeliveryController.index);
routes.post('/delivery', DeliveryController.store);
routes.put('/delivery/:id', DeliveryController.update);
routes.delete('/delivery/:id', DeliveryController.delete);

routes.get('/deliveryman/:deliverymanId/deliveries', OrderController.index);

routes.post('/withdraw/:deliveryId/:deliverymanId', WithdrawController.store);
routes.put('/withdraw/:deliveryId/:deliverymanId', WithdrawController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
