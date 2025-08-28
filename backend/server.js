@@ .. @@
-const { connectDatabase } = require('./config/db');
-const errorHandler = require('./middleware/errorHandler');
-const logger = require('./utils/logger');
+const { connectDatabase } from './src/config/db.js';
+const errorHandler from './src/middleware/errorHandler.js';
+const logger from './src/utils/logger.js';

 // Import routes
-const authRoutes = require('./modules/auth/routes');
-const userRoutes = require('./modules/users/routes');
-const messageRoutes = require('./modules/messages/routes');
+const authRoutes from './src/modules/auth/routes.js';
+const userRoutes from './src/modules/users/routes.js';
+const messageRoutes from './src/modules/messages/routes.js';

 // Import socket handlers
-const socketHandler = require('./sockets');
+const socketHandler from './src/sockets/index.js';