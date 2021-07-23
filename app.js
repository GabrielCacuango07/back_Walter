const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const request = require('request');



const CLIENT = 'Af3pEheLN0lfBqrD2WRyJPVVOt2VscfBfkHSkdhpXJpPb2eVqMI8Pw6wVFUKJK0x8umw7dd_6xY_BXCZ';
const SECRET = 'EHubRnICe-a-nWCZIN0yIzcJ8G68jLbKAp1xzUPnL78yhxyHBfhN3wWjZortPZCszxFP7oyNYkaWUMic';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Live https://api-m.paypal.com


const auth = { user: CLIENT, pass: SECRET }


// Establecemos las rutas 


const createPayment = (req, res) => {

    const body = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD', //https://developer.paypal.com/docs/api/reference/currency-codes/
                value: '310'
            }
        }],
        application_context: {
            brand_name: `Proyecto.com`,
            landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
            user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
            return_url: `http://localhost:3000/execute-payment`, // Url despues de realizar el pago
            cancel_url: `http://localhost:3000/cancel-payment` // Url despues de realizar el pago
        }
    }
    request.post(`${PAYPAL_API}/v2/checkout/orders`, {
        auth,
        body,
        json: true
    }, (err, response) => {
        res.json({ data: response.body })
    })
}




/**
 * Esta funcion captura el dinero REALMENTE
 * @param {*} req 
 * @param {*} res 
 */
const executePayment = (req, res) => {
    const token = req.query.token; //<-----------

    request.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
        auth,
        body: {},
        json: true
    }, (err, response) => {
        res.json({ data: response.body })
    })
}




const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Shop API",
            description: "Backend Api",
            contact: {
                name: 'Amazing Developer'
            },
            servers: "http://localhost:3636"
        }
    },
    apis: ["app.js", ".routes/*.js"]
};

//    http://localhost:3000/create-payment [POST]
app.post(`/create-payment`, createPayment)

/**
 * 3️⃣ Creamos Ruta para luego que el cliente completa el checkout 
 * debemos de capturar el dinero!
 */

app.get(`/execute-payment`, executePayment)


const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


/* CORS */
app.use(cors({
    origin: '*',
    methods: ['GET', 'PUT', 'DELETE', 'PATCH', 'POST'],
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept'
}));
app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Import Routes
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const orderRouter = require('./routes/order');

// Define Routes
/**
 * @swagger
 * /api/products:
 *   get:
 *    description: Get All Products
 *
 */

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', orderRouter);

module.exports = app;