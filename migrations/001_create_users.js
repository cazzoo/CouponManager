migrate((app) => {
  // Don't create users collection - it already exists as an auth collection in PocketBase
  // We just need to ensure it has the role field
  const usersCollection = app.findCollectionByNameOrId("users");
  
  if (usersCollection && !usersCollection.fields.find(f => f.name === "role")) {
    usersCollection.fields.add(new TextField({
      "name": "role",
      "required": true,
      "system": false,
      "presentable": false,
      "options": { "min": 0, "max": 50 }
    }));
      app.save(usersCollection);
  }
}, (app) => {
  // Rollback: remove role field from users collection
  const usersCollection = app.findCollectionByNameOrId("users");
  
  if (usersCollection) {
    const roleField = usersCollection.fields.find(f => f.name === "role");
    if (roleField) {
      usersCollection.fields.remove(roleField);
    app.save(usersCollection);
    }
  }
});
