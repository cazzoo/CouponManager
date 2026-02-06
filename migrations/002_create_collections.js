migrate((app) => {
  const snapshot = [
    {
      "createRule": "@request.auth.id != \"\"",
      "deleteRule": "@request.auth.id != \"\" && @request.auth.data.role = 'manager'",
      "fields": [
        {
          "name": "created",
          "type": "date",
          "system": true,
          "required": false,
          "presentable": false
        },
        {
          "name": "updated",
          "type": "date",
          "system": true,
          "required": false,
          "presentable": false
        },
        {
          "name": "role",
          "type": "text",
          "required": true,
          "system": false,
          "presentable": false,
          "options": { "min": 0, "max": 50 }
        },
        {
          "name": "userId",
          "type": "text",
          "required": true,
          "system": false,
          "presentable": false,
          "options": { "min": 0, "max": 100 }
        }
      ],
      "indexes": [],
      "listRule": "@request.auth.id != \"\"",
      "name": "user_roles",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != \"\" && (userId = @request.auth.id || @request.auth.data.role = 'manager')",
      "viewRule": "@request.auth.id != \"\""
    },
    {
      "createRule": "@request.auth.data.role = 'manager'",
      "deleteRule": "@request.auth.data.role = 'manager'",
      "fields": [
        {
          "name": "created",
          "type": "date",
          "system": true,
          "required": false,
          "presentable": false
        },
        {
          "name": "updated",
          "type": "date",
          "system": true,
          "required": false,
          "presentable": false
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "system": false,
          "presentable": true,
          "options": { "min":1, "max": 100 }
        },
        {
          "name": "website",
          "type": "url",
          "required": false,
          "system": false,
          "presentable": true
        },
        {
          "name": "logo",
          "type": "file",
          "required": false,
          "system": false,
          "presentable": false,
          "options": { "maxSelect": 1, "maxSize": 5242880, "mimeTypes": ["image/jpeg", "image/png", "image/webp"] }
        }
      ],
      "indexes": [],
      "listRule": "@request.auth.id != \"\"",
      "name": "retailers",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.data.role = 'manager'",
      "viewRule": "@request.auth.id != \"\""
    },
    {
      "createRule": "@request.auth.id != \"\"",
      "deleteRule": "userId = @request.auth.id || @request.auth.data.role = 'manager'",
      "fields": [
        {
          "name": "created",
          "type": "date",
          "system": true,
          "required": false,
          "presentable": false
        },
        {
          "name": "updated",
          "type": "date",
          "system": true,
          "required": false,
          "presentable": false
        },
        {
          "name": "userId",
          "type": "text",
          "required": true,
          "system": false,
          "presentable": false,
          "options": { "min": 0, "max": 100 }
        },
        {
          "name": "retailer",
          "type": "text",
          "required": true,
          "system": false,
          "presentable": true,
          "options": { "min":1, "max": 100 }
        },
        {
          "name": "initialValue",
          "type": "text",
          "required": true,
          "system": false,
          "presentable": true,
          "options": { "min": 0, "max": 50 }
        },
        {
          "name": "currentValue",
          "type": "text",
          "required": true,
          "system": false,
          "presentable": true,
          "options": { "min": 0, "max": 50 }
        },
        {
          "name": "expirationDate",
          "type": "date",
          "required": false,
          "system": false,
          "presentable": true,
          "options": { "min": "" }
        },
        {
          "name": "notes",
          "type": "editor",
          "required": false,
          "system": false,
          "presentable": false
        },
        {
          "name": "barcode",
          "type": "text",
          "required": false,
          "system": false,
          "presentable": false,
          "options": { "min": 0, "max": 200 }
        },
        {
          "name": "reference",
          "type": "text",
          "required": false,
          "system": false,
          "presentable": false,
          "options": { "min": 0, "max": 100 }
        },
        {
          "name": "activationCode",
          "type": "text",
          "required": false,
          "system": false,
          "presentable": false,
          "options": { "min": 0, "max": 50 }
        },
        {
          "name": "pin",
          "type": "text",
          "required": false,
          "system": false,
          "presentable": false,
          "options": { "min": 0, "max": 10 }
        }
      ],
      "indexes": [],
      "listRule": "(userId = @request.auth.id) || (@request.auth.data.role = 'manager')",
      "name": "coupons",
      "system": false,
      "type": "base",
      "updateRule": "(userId = @request.auth.id) || (@request.auth.data.role = 'manager')",
      "viewRule": "(userId = @request.auth.id) || (@request.auth.data.role = 'manager')"
    }
  ];

  app.importCollections(snapshot, false);
}, (app) => {
  const retailers = app.findCollectionByNameOrId("retailers");
  const coupons = app.findCollectionByNameOrId("coupons");
  const userRoles = app.findCollectionByNameOrId("user_roles");

  if (retailers) {
    app.deleteCollection(retailers);
  }

  if (coupons) {
    app.deleteCollection(coupons);
  }

  if (userRoles) {
    app.deleteCollection(userRoles);
  }
});
