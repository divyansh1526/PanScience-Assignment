
import swaggerJSDoc from 'swagger-jsdoc';
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'PanScience Task API', version: '1.0.0', description: 'Task management API' },
    servers: [{ url: process.env.SWAGGER_BASE || 'http://localhost:5000' }]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};
export default swaggerJSDoc(options);
