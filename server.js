'use strict';

import config from './config';
import logger from './app/logger';
import routes from './app/routes';

import express from 'express';
import bodyParser from 'body-parser';

var app = express();
app.use(bodyParser.json());

routes.configure(app);

var port = config.port;
app.listen(port);

logger('Listening on port ' + port);