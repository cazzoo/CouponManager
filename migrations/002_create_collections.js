/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const snapshot = [
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "name": "name",
          "type": "text",
          "required": true,
          "hidden": false,
          "presentable": true,
          "options": { "min":1, "max": 100 }
        },
        {
          "name": "website",
          "type": "url",
          "required": false,
          "hidden": false,
          "presentable": true
        },
        {
          "name": "logo",
          "type": "file",
          "required": false,
          "hidden": false,
          "presentable": false,
          "options": { "maxSelect": 1, "maxSize": 5242880, "mimeTypes": ["image/jpeg", "image/png", "image/webp"] }
        }
      ],
      "indexes": [],
      "listRule": null,
      "name": "retailers",
      "system": false,
      "type": "base",
      "updateRule": null,
      "viewRule": null
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "name": "retailer",
          "type": "text",
          "required": true,
          "hidden": false,
          "presentable": true,
          "options": { "min":1, "max": 100 }
        },
        {
          "name": "initialValue",
          "type": "text",
          "required": true,
          "hidden": false,
          "presentable": true,
          "options": { "min": 0, "max": 50 }
        },
        {
          "name": "currentValue",
          "type": "text",
          "required": true,
          "hidden": false,
          "presentable": true,
          "options": { "min": 0, "max": 50 }
        },
        {
          "name": "expirationDate",
          "type": "date",
          "required": false,
          "hidden": false,
          "presentable": true,
          "options": { "min": "" }
        },
        {
          "name": "notes",
          "type": "editor",
          "required": false,
          "hidden": false,
          "presentable": false
        },
        {
          "name": "barcode",
          "type": "text",
          "required": false,
          "hidden": false,
          "presentable": false,
          "options": { "min": 0, "max": 200 }
        },
        {
          "name": "reference",
          "type": "text",
          "required": false,
          "hidden": false,
          "presentable": false,
          "options": { "min": 0, "max": 100 }
        },
        {
          "name": "activationCode",
          "type": "text",
          "required": false,
          "hidden": false,
          "presentable": false,
          "options": { "min": 0, "max": 50 }
        },
        {
          "name": "pin",
          "type": "text",
          "required": false,
          "hidden": false,
          "presentable": false,
          "options": { "min": 0, "max": 10 }
        }
      ],
      "indexes": [],
      "listRule": null,
      "name": "coupons",
      "system": false,
      "type": "base",
      "updateRule": null,
      "viewRule": null
    }
  ];

  app.importCollections(snapshot, false);
}, (app) => {
  const retailers = app.findCollectionByNameOrId("retailers");
  const coupons = app.findCollectionByNameOrId("coupons");

  if (retailers) {
    app.deleteCollection(retailers);
  }

  if (coupons) {
    app.deleteCollection(coupons);
  }
});
