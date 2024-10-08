import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";

const app = new Koa();
const router = new Router();
const PORT = 3000;

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, () => {
	console.log(`Api serving on http://localhost:${PORT}`);
});
