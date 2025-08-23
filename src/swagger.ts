import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import YAML from 'yamljs';

// Load the OpenAPI YAML file
const swaggerSpec = YAML.load('./src/docs/openapi.yaml');

export function setupSwagger(app: Application): void {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
