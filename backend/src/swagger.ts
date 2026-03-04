import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PAS Prototype API',
      version: '1.0.0',
      description: 'Policy Administration System - Backend API for managing policies, claims, underwriting, and more.',
      contact: {
        name: 'PAS Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@pas.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        Policy: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'POL-2026-00001' },
            customerId: { type: 'string' },
            policyType: { type: 'string', enum: ['Mortgage Guarantee', 'Credit Protection', 'Coverage Plus'] },
            status: { type: 'string', enum: ['Draft', 'Active', 'Lapsed', 'Cancelled', 'Expired'] },
            premiumAmount: { type: 'number' },
            coverageAmount: { type: 'number' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            riskCategory: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            version: { type: 'integer' },
          },
        },
        Claim: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'CLM001' },
            policyId: { type: 'string' },
            claimType: { type: 'string', enum: ['Default', 'Property Damage', 'Fraud', 'Other'] },
            status: { type: 'string', enum: ['Filed', 'Under Review', 'Approved', 'Rejected', 'Settled'] },
            amount: { type: 'number' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            riskCategory: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          },
        },
        EvaluationRequest: {
          type: 'object',
          required: ['policyId', 'applicantAge', 'creditScore', 'income', 'propertyValue', 'loanAmount', 'propertyZone', 'annualPremium'],
          properties: {
            policyId: { type: 'string' },
            applicantAge: { type: 'integer' },
            creditScore: { type: 'integer' },
            income: { type: 'number' },
            propertyValue: { type: 'number' },
            loanAmount: { type: 'number' },
            propertyZone: { type: 'string' },
            annualPremium: { type: 'number' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Policies', description: 'Policy management' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Underwriting', description: 'Underwriting evaluation' },
      { name: 'Claims', description: 'Claims management' },
      { name: 'Documents', description: 'Document management' },
      { name: 'Dashboard', description: 'Dashboard and analytics' },
      { name: 'Admin', description: 'Administration' },
    ],
    paths: {
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/api/v1/auth/profile': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          responses: { '200': { description: 'Profile retrieved' } },
        },
      },
      '/api/v1/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout (invalidate token)',
          responses: { '200': { description: 'Logged out' } },
        },
      },
      '/api/v1/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          security: [],
          responses: { '200': { description: 'Token refreshed' } },
        },
      },
      '/api/v1/policies': {
        get: {
          tags: ['Policies'],
          summary: 'List policies',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'policyType', in: 'query', schema: { type: 'string' } },
            { name: 'customerId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Policies retrieved' } },
        },
        post: {
          tags: ['Policies'],
          summary: 'Create a new policy',
          responses: { '201': { description: 'Policy created' } },
        },
      },
      '/api/v1/policies/{id}': {
        get: {
          tags: ['Policies'],
          summary: 'Get policy by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Policy retrieved' } },
        },
        put: {
          tags: ['Policies'],
          summary: 'Update policy',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Policy updated' } },
        },
      },
      '/api/v1/policies/{id}/status': {
        patch: {
          tags: ['Policies'],
          summary: 'Change policy status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Status updated' } },
        },
      },
      '/api/v1/customers': {
        get: { tags: ['Customers'], summary: 'List customers', responses: { '200': { description: 'Customers retrieved' } } },
        post: { tags: ['Customers'], summary: 'Create customer', responses: { '201': { description: 'Customer created' } } },
      },
      '/api/v1/customers/search': {
        get: { tags: ['Customers'], summary: 'Search customers', responses: { '200': { description: 'Search results' } } },
      },
      '/api/v1/underwriting/evaluate': {
        post: { tags: ['Underwriting'], summary: 'Evaluate underwriting', responses: { '201': { description: 'Evaluation complete' } } },
      },
      '/api/v1/underwriting/rules': {
        get: { tags: ['Underwriting'], summary: 'Get underwriting rules', responses: { '200': { description: 'Rules retrieved' } } },
      },
      '/api/v1/claims': {
        get: { tags: ['Claims'], summary: 'List claims', responses: { '200': { description: 'Claims retrieved' } } },
        post: { tags: ['Claims'], summary: 'Register claim', responses: { '201': { description: 'Claim registered' } } },
      },
      '/api/v1/documents': {
        get: { tags: ['Documents'], summary: 'List documents', responses: { '200': { description: 'Documents retrieved' } } },
        post: { tags: ['Documents'], summary: 'Upload document metadata', responses: { '201': { description: 'Document uploaded' } } },
      },
      '/api/v1/dashboard/summary': {
        get: { tags: ['Dashboard'], summary: 'Get dashboard summary', responses: { '200': { description: 'Summary retrieved' } } },
      },
      '/api/v1/dashboard/claims': {
        get: { tags: ['Dashboard'], summary: 'Get claims analytics', responses: { '200': { description: 'Analytics retrieved' } } },
      },
      '/api/v1/dashboard/underwriting': {
        get: { tags: ['Dashboard'], summary: 'Get underwriting stats', responses: { '200': { description: 'Stats retrieved' } } },
      },
      '/api/v1/dashboard/risk': {
        get: { tags: ['Dashboard'], summary: 'Get risk breakdown', responses: { '200': { description: 'Breakdown retrieved' } } },
      },
      '/api/v1/admin/users': {
        get: { tags: ['Admin'], summary: 'List all users', responses: { '200': { description: 'Users retrieved' } } },
        post: { tags: ['Admin'], summary: 'Create user', responses: { '201': { description: 'User created' } } },
      },
      '/api/v1/admin/logs': {
        get: { tags: ['Admin'], summary: 'Get system logs', responses: { '200': { description: 'Logs retrieved' } } },
      },
    },
  },
  apis: [], // We defined paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);
