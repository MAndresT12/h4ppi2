/**
 * docker/mongo/init.js
 * Se ejecuta automáticamente la PRIMERA VEZ que arranca el contenedor de MongoDB.
 * Crea el usuario de la aplicación con permisos limitados (buena práctica de seguridad).
 */
// db es la base de datos de mongo.
//No es necesario este script de inicializacion, ya que mongo se inicializa con el usuario y la base de datos por defecto cuando usemos mongoose. 

// Cambiar a la base de datos de la app
db = db.getSiblingDB('h4ppi');

// Crear usuario de la app (con permisos solo sobre h4ppi, no sobre todo el servidor)

db.createUser({
    user: process.env.MONGO_APP_USERNAME,
    pwd: process.env.MONGO_APP_PASSWORD,
    roles: [
        {
            role: 'readWrite',
            db: 'h4ppi'
        }
    ]
});

print('✅  Usuario h4ppi_app creado');

// Pre-crear las colecciones con sus validaciones básicas
// (MongoDB las crea solas también, pero esto fuerza el esquema desde el inicio)

db.createCollection('users');
db.createCollection('events');
db.createCollection('messages');
db.createCollection('connections');
db.createCollection('swipes');
db.createCollection('directmessages');
db.createCollection('notifications');
db.createCollection('reports');

print('✅  Colecciones creadas');

// Los índices más críticos los creamos aquí también como respaldo
// (Mongoose los crea al arrancar, pero si hay algún problema esto los garantiza)

db.users.createIndex({ location: '2dsphere' });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.events.createIndex({ location: '2dsphere' });
//indice compuesto por status y category para que se pueda buscar por status y category
db.events.createIndex({ status: 1, category: 1 });
db.events.createIndex({ hostId: 1 });

db.messages.createIndex({ eventId: 1, createdAt: 1 });
//Solo deberia existir un swipe por cada usuario para cada evento, por lo que el indice compuesto fromUserId y toUserId debe ser unico.
db.swipes.createIndex({ fromUserId: 1, toUserId: 1 }, { unique: true });
db.connections.createIndex({ users: 1, status: 1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 días TTL (Time To Live) para que se eliminen automaticamente despues de 30 dias.

print('✅  Índices creados');
print('🎉  MongoDB inicializado para H4ppi');
