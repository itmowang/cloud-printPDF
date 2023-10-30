"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const prompts = require("prompts");
const printer = require("@woovi/node-printer");
const koa = require("koa");
const koaBodyParser = require("koa-bodyparser");
const printers = printer.getPrinters();
const frpcf = require("./conf/frp");
// 初始化koa
const koaInit = (printerName) => {
    const app = new koa();
    // 使用koa-bodyparser
    app.use(koaBodyParser());
    app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        ctx.request.header['printerName'] = printerName;
        yield next();
    }));
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
    frpcf.updpFRP({});
};
const questions = [
    {
        type: "select",
        name: "printerName",
        message: "请选择打印机目标映射",
        choices: printers.map((item) => {
            return {
                title: item.name,
                value: item.name,
            };
        }),
    },
];
(() => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield prompts(questions);
    const { printerName } = response;
    koaInit(printerName);
    frpcInit();
}))();
