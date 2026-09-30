export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RelaxMap / Природні Мандри API',
    version: '1.0.0',
    description:
      'Технічна документація ендпоінтів бекенду для проєкту RelaxMap.\n\n' +
      "Формат успішних відповідей: один об'єкт — { data: {...} }; " +
      'список з пагінацією — { data: [...], page, limit, totalPages, total }. ' +
      'Помилки — { message }.',
  },
  servers: [
    {
      url: '/',
      description: 'Поточний сервер',
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
          201: {
            description:
              'Користувача створено, повертає { data: user }, сесія в cookie',
          },
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
            description:
              'Успішний вхід, повертає { data: user }, сесія в cookie',
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
          200: {
            description:
              'Повертає { message: "Successfully refreshed a session!" }, нові cookies',
          },
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
            description:
              'Повертає { data: { locationTypes: [...], regions: [...] } }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        locationTypes: {
                          type: 'array',
                          items: { type: 'object' },
                        },
                        regions: { type: 'array', items: { type: 'object' } },
                      },
                    },
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
          200: { description: 'Повертає { data: user } поточного юзера' },
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
          200: {
            description: 'Повертає { data: { name, avatar, articlesAmount } }',
          },
          400: { description: 'Невалідний формат id' },
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
            schema: { type: 'number', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'number', default: 9 },
          },
        ],
        responses: {
          200: {
            description:
              'Повертає { data: [локації], page, limit, totalPages, total }',
          },
          400: {
            description: 'Невалідний формат id або параметрів пагінації',
          },
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
            schema: { type: 'number' },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'number' },
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
          200: {
            description:
              'Повертає { data: [локації], page, limit, totalPages, total }',
          },
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
                  coordinates: {
                    type: 'string',
                    description:
                      "Необов'язково. JSON-рядок з lat і lon (обидва числа)",
                    example: '{"lat":50.4501,"lon":30.5234}',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Локацію створено, повертає { data: location }' },
          400: { description: 'Помилка валідації або немає файлу' },
          401: { description: 'Не авторизовано' },
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
              'Повертає { data: location } з розгорнутими (populate) схваленими відгуками та автором',
          },
          400: { description: 'Невалідний формат id' },
          404: { description: 'Локацію не знайдено' },
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
          200: { description: 'Локацію оновлено, повертає { data: location }' },
          400: {
            description: 'Помилка валідації або немає даних для оновлення',
          },
          401: { description: 'Не авторизовано' },
          403: { description: 'Дія заборонена (ви не є автором цієї локації)' },
          404: { description: 'Локацію не знайдено' },
        },
      },
    },

    // 10. Учасник №12 (Відгуки)
    '/api/feedbacks': {
      get: {
        summary: 'Список схвалених відгуків з пагінацією (Public)',
        tags: ['Feedbacks'],
        parameters: [
          {
            name: 'locationId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Фільтр за локацією (валідний MongoDB id)',
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'number', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          200: {
            description:
              'Повертає { data: [відгуки], page, limit, totalPages, total }',
          },
        },
      },
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
                  rate: { type: 'number', minimum: 1, maximum: 5 },
                  description: { type: 'string', minLength: 1, maxLength: 200 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description:
              'Відгук створено (status: pending), повертає { data: feedback }',
          },
          400: {
            description:
              'Помилка валідації (locationId, userName, rate, description)',
          },
          401: { description: 'Не авторизовано' },
          404: { description: 'Локацію не знайдено' },
        },
      },
    },
    '/api/feedbacks/last-reviews': {
      get: {
        summary:
          'Отримання 5-6 останніх відгуків для головної сторінки (Public)',
        tags: ['Feedbacks'],
        responses: {
          200: {
            description:
              'Повертає { data: [до 6 схвалених відгуків з populate локацій] }',
          },
        },
      },
    },
  },
};
