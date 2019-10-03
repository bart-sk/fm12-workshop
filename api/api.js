const Koa = require('koa');
const Router = require('@koa/router');
var bodyParser = require('koa-bodyparser');
const { logger: accesslog } = require('koa2-winston');
const winston = require('winston');
const { Client } = require('@elastic/elasticsearch');

const app = new Koa();
const router = new Router();

// logger miesto konzoly
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.simple()
      ),
      // silent: process.env.NODE_ENV !== 'development',
    }),
    new winston.transports.File({
      filename: 'logs/info.log',
      level: 'info'
    }),
  ],
});

// elastic klient
const elastic = new Client({
  node: process.env.ELASTIC_CLIENT_NODE || 'http://localhost:9200',
});

const elasticIndexName = process.env.ELASTIC_INDEX_NAME || 'test';

router.post('/sensors', async (ctx, next) => {
  if (!ctx.is('application/json')) {
    ctx.throw(
      400,
      'INVALID_SCHEMA',
      'Required content-type is application/json'
    );
  }
  const { body: result } = await elastic.index({
    index: elasticIndexName,
    body: ctx.request.body,
  });
  ctx.body = (await elastic.get({
    id: result._id,
    index: elasticIndexName,
  })).body;
});


router.get('/status', async (ctx, next) => {
  ctx.body = {test: true};
});

app
  .use(bodyParser())
  .use(
    accesslog({
      transports: [new winston.transports.Console({
        json: true,
        stringify: true,
      }), new winston.transports.File({
        filename: 'logs/access.log'
      })],
      level: 'info',
      reqKeys: [
        'header',
        'url',
        'method',
        'httpVersion',
        'href',
        'query',
        'length',
      ],
      reqSelect: ['ip'],
      reqUnselect: ['header.cookie'],
      resKeys: ['header', 'status'],
      resSelect: [],
      resUnselect: [],
    })
  )
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.API_PORT || 9000;
app.listen(port, () => {
  logger.info(`Server is listening on port ${port}`);
});
