import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3001;

process.on('unhandledRejection', (reason) => {
  console.error('\n🔥 UNHANDLED REJECTION:');
  console.error(reason);
});

process.on('uncaughtException', (error) => {
  console.error('\n🔥 UNCAUGHT EXCEPTION:');
  console.error(error);
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});

server.on('error', (error) => {
  console.error('\n🔥 SERVER ERROR:');
  console.error(error);
});