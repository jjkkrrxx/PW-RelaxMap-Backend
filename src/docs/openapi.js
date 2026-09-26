export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RelaxMap / Природні Мандри API',
    version: '1.0.0',
    description:
      'Технічна документація ендпоінтів бекенду для проєкту RelaxMap',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Локальний сервер розробки',
    },
  ],
  paths: {
    // 1. Учасник №3 (Реєстрація)
    '/api/auth/register': {
      post: {
        summary: 'Реєстрація нового користувача (Public)',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 32,
                    example: 'Андрій',
                  },
                  email: {
                    type: 'string',
                    maxLength: 64,
                    example: 'user@example.com',
                  },
                  password: {
                    type: 'string',
                    minLength: 8,
                    maxLength: 128,
                    example: 'secret1234',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Користувача створено успішно' },
          400: { description: 'Помилка валідації celebrate (ліміти довжини)' },
          409: { description: 'Email already in use (Email зайнятий)' },
        },
      },
    },

    // 2. Учасник №6 (Вхід)
    '/api/auth/login': {
      post: {
        summary: 'Авторизація користувача (Public)',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'secret1234' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Успішний вхід, повертає об'єкт user, сесія в cookie",
          },
          401: { description: 'Невірно вказано email або password' },
        },
      },
    },

    // 3. Учасник №4 (Оновлення сесії)
    '/api/auth/refresh': {
      post: {
        summary: 'Оновлення токенів сесії (Private, за куками)',
        tags: ['Auth'],
        responses: {
          200: { description: 'Successfully refreshed a session!' },
          401: { description: 'Refresh token протух або невалідний' },
        },
      },
    },

    // 4. Team Lead / Учасник №1 (Вихід з акаунту)
    '/api/auth/logout': {
      post: {
        summary: 'Вихід з акаунту (Private)',
        tags: ['Auth'],
        responses: {
          204: {
            description:
              'Сесію видалено, cookies очищено, тіло відповіді порожнє',
          },
        },
      },
    },

    // 5. Scrum Master / Учасник №2 (Категорії та регіони)
    '/api/categories': {
      get: {
        summary:
          'Отримання списку категорій та регіонів за один запит (Public)',
        tags: ['Data'],
        responses: {
          200: {
            description: "Повертає об'єкт з масивами regions та locationTypes",
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    regions: { type: 'array', items: { type: 'object' } },
                    locationTypes: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },

    // 6. Учасник №5 (Поточний юзер)
    '/api/users/current': {
      get: {
        summary: 'Дані поточного авторизованого користувача (Private)',
        tags: ['Users'],
        responses: {
          200: { description: "Повертає об'єкт профілю поточного юзера" },
          401: { description: 'Відсутній або протухлий token' },
        },
      },
    },

    // 7. Учасник №7 (Публічний профіль іншого юзера)
    '/api/users/{userId}': {
      get: {
        summary: 'Отримання публічних даних користувача (Public)',
        tags: ['Users'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Повертає name, avatar, articlesAmount' },
          404: { description: 'Користувача не знайдено' },
        },
      },
    },

    // 8. Учасник №8 (Локації юзера)
    '/api/users/{userId}/locations': {
      get: {
        summary: 'Список локацій конкретного користувача з пагінацією (Public)',
        tags: ['Catalog'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 9 },
          },
        ],
        responses: {
          200: { description: 'Масив локацій юзера з пагінацією' },
        },
      },
    },

    // 9. Учасник №9, №10, №11 (Загальний каталог локацій, створення, деталі)
    '/api/locations': {
      get: {
        summary:
          'Отримання списку всіх локацій з фільтрами, пошуком та сортуванням (Public)',
        tags: ['Catalog'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
          },
          {
            name: 'region',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'slug регіону',
          },
          {
            name: 'type',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'slug типу або значення "popular"',
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Відфільтрований список локацій' },
        },
      },
      post: {
        summary:
          'Створення нової локації (Private + завантаження фото в Cloudinary)',
        tags: ['Catalog'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: [
                  'name',
                  'locationType',
                  'region',
                  'description',
                  'images',
                ],
                properties: {
                  name: { type: 'string', minLength: 3, maxLength: 96 },
                  locationType: {
                    type: 'string',
                    maxLength: 64,
                    description: 'slug',
                  },
                  region: {
                    type: 'string',
                    maxLength: 64,
                    description: 'slug',
                  },
                  description: {
                    type: 'string',
                    minLength: 20,
                    maxLength: 6000,
                  },
                  images: {
                    type: 'string',
                    format: 'binary',
                    description: 'jpg/png <1MB',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Локацію успішно створено' },
        },
      },
    },

    '/api/locations/{id}': {
      get: {
        summary:
          'Детальна інформація про локацію з відгуками та автором (Public)',
        tags: ['Catalog'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description:
              "Об'єкт локації з розгорнутими (populate) відгуками та автором",
          },
        },
      },
      patch: {
        summary: 'Редагування локації (Private, ТІЛЬКИ АВТОР)',
        tags: ['Catalog'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Локацію успішно оновлено' },
          403: { description: 'Дія заборонена (ви не є автором цієї локації)' },
        },
      },
    },

    // 10. Учасник №12 (Відгуки)
    '/api/feedbacks': {
      post: {
        summary: 'Створення відгуку до місця на модерацію (Private)',
        tags: ['Feedbacks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['locationId', 'userName', 'rate', 'description'],
                properties: {
                  locationId: {
                    type: 'string',
                    description: 'Валідний MongoDB id',
                  },
                  userName: { type: 'string', minLength: 2, maxLength: 32 },
                  rate: { type: 'integer', minimum: 1, maximum: 5 },
                  description: { type: 'string', minLength: 1, maxLength: 200 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Відгук створено та відправлено на модерацію' },
        },
      },
    },
    '/api/feedbacks/last-reviews': {
      get: {
        summary:
          'Отримання 5-6 останніх відгуків для головної сторінки (Public)',
        tags: ['Feedbacks'],
        responses: {
          200: { description: 'Список останніх відгуків з populate локацій' },
        },
      },
    },
  },
};
