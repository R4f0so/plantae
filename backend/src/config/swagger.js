import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🌱 Plantae API',
      version: '1.0.0',
      description: `
        API REST para gerenciamento de hortas comunitárias da região de Osasco (SP).
        
        ## Funcionalidades
        
        - 🔐 Autenticação JWT com refresh tokens
        - 👥 Gerenciamento de usuários (comum, gerenciador, admin)
        - 🏡 CRUD de hortas comunitárias
        - 📍 Busca geolocalizada de hortas próximas
        - 🥬 Gerenciamento de produtos e estoque
        - 🔒 Controle de permissões por tipo de usuário
        
        ## Autenticação
        
        A maioria dos endpoints requer autenticação via JWT token.
        
        1. Registre um usuário em \`/api/auth/register\`
        2. Faça login em \`/api/auth/login\` para obter o token
        3. Use o token no header: \`Authorization: Bearer SEU_TOKEN\`
        4. Clique no botão "Authorize" 🔓 acima e cole seu token
      `,
      contact: {
        name: 'Rafael Ferreira Martins',
        email: 'contato@plantae.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://api.plantae.com',
        description: 'Servidor de Produção',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Autenticação e gerenciamento de sessão',
      },
      {
        name: 'Hortas',
        description: 'Gerenciamento de hortas comunitárias',
      },
      {
        name: 'Produtos',
        description: 'Gerenciamento de produtos e estoque',
      },
      {
        name: 'Sistema',
        description: 'Endpoints do sistema',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID do usuário',
            },
            nome: {
              type: 'string',
              description: 'Nome completo',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
            },
            tipo: {
              type: 'string',
              enum: ['comum', 'gerenciador', 'admin'],
              description: 'Tipo de usuário',
            },
            telefone: {
              type: 'string',
              description: 'Telefone de contato',
            },
            foto_perfil: {
              type: 'string',
              description: 'URL da foto de perfil',
            },
            ativo: {
              type: 'boolean',
              description: 'Status do usuário',
            },
          },
        },
        Horta: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID da horta',
            },
            nome: {
              type: 'string',
              description: 'Nome da horta',
            },
            descricao: {
              type: 'string',
              description: 'Descrição detalhada',
            },
            endereco: {
              type: 'string',
              description: 'Endereço completo',
            },
            latitude: {
              type: 'number',
              format: 'double',
              description: 'Latitude (-90 a 90)',
            },
            longitude: {
              type: 'number',
              format: 'double',
              description: 'Longitude (-180 a 180)',
            },
            gerenciador_id: {
              type: 'integer',
              description: 'ID do gerenciador',
            },
            gerenciador_nome: {
              type: 'string',
              description: 'Nome do gerenciador',
            },
            horario_funcionamento: {
              type: 'string',
              description: 'Horários de funcionamento',
            },
            foto_capa: {
              type: 'string',
              description: 'URL da foto de capa',
            },
            ativo: {
              type: 'boolean',
              description: 'Status da horta',
            },
            distancia: {
              type: 'number',
              description: 'Distância em metros (apenas em buscas próximas)',
            },
          },
        },
        Produto: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID do produto',
            },
            horta_id: {
              type: 'integer',
              description: 'ID da horta',
            },
            nome: {
              type: 'string',
              description: 'Nome do produto',
            },
            descricao: {
              type: 'string',
              description: 'Descrição do produto',
            },
            categoria: {
              type: 'string',
              enum: ['fruta', 'verdura', 'legume', 'erva', 'outro'],
              description: 'Categoria do produto',
            },
            preco: {
              type: 'number',
              format: 'double',
              description: 'Preço do produto',
            },
            unidade: {
              type: 'string',
              description: 'Unidade de medida (kg, unidade, maço)',
            },
            estoque: {
              type: 'number',
              format: 'double',
              description: 'Quantidade em estoque',
            },
            foto: {
              type: 'string',
              description: 'URL da foto do produto',
            },
            disponivel: {
              type: 'boolean',
              description: 'Disponibilidade do produto',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './server.js'], // Arquivos com anotações
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;