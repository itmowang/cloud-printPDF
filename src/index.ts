const prompts = require("prompts");
const printer = require("@woovi/node-printer");
const koa = require("koa");
const koaBodyParser = require("koa-bodyparser");
const printers = printer.getPrinters();
const frpcf = require("./conf/frp");

 
// 初始化koa
const koaInit = (printerName: any) => {
  const app = new koa();
  // 使用koa-bodyparser
  app.use(koaBodyParser());

  app.use(async (ctx: any, next: any) => {
    ctx.request.header['printerName'] = printerName;
    await next();
  });

  // 注册路由
  const printsRouter = require("./routes/prints");
  app.use(printsRouter.routes(), printsRouter.allowedMethods());
  //   开启端口
  app.listen(3000, () => {
    console.log("监听端口 3000");
    console.log("打印接口1 http://localhost:3000/prints/printsFile  {file:'123'}");
  });

};

const frpcInit = () => {
  frpcf.updpFRP({
   
  })
}

const questions = [
  {
    type: "select",
    name: "printerName",
    message: "请选择打印机目标映射",
    choices: printers.map((item: { name: any }) => {
      return {
        title: item.name,
        value: item.name,
      };
    }),
  },
];

(async () => {
  const response = await prompts(questions);
  const { printerName } = response;
  koaInit(printerName);
  frpcInit()
})();
