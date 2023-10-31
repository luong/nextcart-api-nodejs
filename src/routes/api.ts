import express from 'express';
import ProductController from '@/controllers/product-controller';
import AuthMiddleware from '@/middleware/auth-middleware';
import CustomerController from '@/controllers/customer-controller';
import OrderController from '@/controllers/order-controller';
import AuthController from '@/controllers/auth-controller';
import ServerController from '@/controllers/server-controller';

const router = express.Router();

router.get('/server/ping', ServerController.ping);
router.post('/auth/login', AuthController.login);

router.post('/customers', AuthMiddleware.authenticated, CustomerController.createCustomer);
router.get('/customers/:id', AuthMiddleware.authenticated, CustomerController.getCustomerById);
router.put('/customers/:id', AuthMiddleware.authenticated, CustomerController.updateCustomer)

router.post('/customers/:customerId/addresses', AuthMiddleware.authenticated, CustomerController.createAddress);
router.get('/customers/:customerId/addresses', AuthMiddleware.authenticated, CustomerController.getAddresses);
router.put('/customers/:customerId/addresses/:addressId', AuthMiddleware.authenticated, CustomerController.updateAddress);
router.delete('/customers/:customerId/addresses/:addressId', AuthMiddleware.authenticated, CustomerController.deleteAddress);

router.post('/customers/:customerId/cart', AuthMiddleware.authenticated, OrderController.addToCart);
router.get('/customers/:customerId/cart', AuthMiddleware.authenticated, OrderController.getCart);
router.put('/customers/:customerId/cart/:cartItemId', AuthMiddleware.authenticated, OrderController.updateCart);
router.delete('/customers/:customerId/cart/:cartItemId', AuthMiddleware.authenticated, OrderController.deleteCart);

router.post('/customers/:customerId/orders', AuthMiddleware.authenticated, OrderController.createOrder);
router.get('/customers/:customerId/orders/:orderId', AuthMiddleware.authenticated, OrderController.getOrderById);
router.put('/customers/:customerId/orders/:orderId', AuthMiddleware.authenticated, OrderController.updateOrder);

router.get('/products', ProductController.getAllProducts);
router.get('/products/:id', ProductController.getProductById);
router.get('/brands', ProductController.getAllBrands);

export default router;