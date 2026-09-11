import mongoose from 'mongoose';

/**
 * Conecta a MongoDB usando la URI del .env
 * Incluye reintentos automáticos cada 5 segundos si falla la conexión
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌  MONGO_URI no está definida en el .env');
    process.exit(1);
  }

  // Opciones de conexión recomendadas para producción
  const options: mongoose.ConnectOptions = {
    // Usa el nuevo engine de parseo de URL
    serverSelectionTimeoutMS: 5000, // 5s para seleccionar servidor
    socketTimeoutMS: 45000,         // 45s para operaciones
    maxPoolSize: 10,                // máximo de conexiones simultáneas
  };

  const connect = async () => {
    try {
      await mongoose.connect(uri, options);
      console.log(`✅  MongoDB conectado: ${mongoose.connection.host}`);
    } catch (err) {
      console.error(' Error al conectar con MongoDB:', err);
      console.log(' Reintentando en 5 segundos...');
      //setTimeout(connect, 5000);

      /*Para esperar que haya una reconexion antes de continuar,
      Asi la API no recibe peticiones hasta que NO se conecte*/

      /* De esta manera, index.ts no continúa con app.listen()
      hasta que MongoDB esté conectado correctamente. */
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await connect(); // recursión ESPERADA: connectDB() no se resuelve hasta que esto se resuelva
    }
  };

  await connect();

  // Eventos de conexión útiles para debug
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️   MongoDB desconectado — reintentando...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅  MongoDB reconectado');
  });
};