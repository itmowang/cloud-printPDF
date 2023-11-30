const router = require("koa-router")();
const pdfium = require("node-pdfium");
const koa2 = require("koa");
const { PDFDocument, rgb } = require("pdf-lib");
const { v4: uuidv4 } = require("uuid"); // 导入uuid模块
const http = require("http");

const firstImg = (localFilePath: string, folderPath: string) => { 
  return new Promise((resolve, reject) => {



    const inputFilePath = localFilePath; // 替换为你的输入文件路径
    const outputFilePath = folderPath + "/example.pdf"; // 替换为你的输出文件路径
    const cropX = 0; // 左边裁剪的点坐标
    const cropY = 0; // 底部裁剪的点坐标
    const cropWidth = 310; // 裁剪的宽度
    const cropHeight = 800; // 裁剪的高度

    const run = async () => {
      const fs = require("fs")
      // 读取输入 PDF 文件
      const existingPdfBytes = fs.readFileSync(inputFilePath);

      // 创建一个 PDF 文档对象
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const [firstPage] = pdfDoc.getPages();

      // 裁剪页面
      firstPage.setSize(cropWidth, cropHeight);
      firstPage.setCropBox(0, 0, cropWidth, cropHeight);

      // 保存 PDF
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outputFilePath, pdfBytes);

      resolve(outputFilePath);
    };

    run().catch((error) => {
      console.log(error);
      reject(error);
    });
  });
};

// 设置路由前缀
router.prefix("/prints");

router.post("/printsFile", async (ctx: any, next: any) => {
  const fs = require("fs");
  const path = require("path");

  const { file } = ctx.request.body;
  const { printerName } = ctx.request.header;
  if (file) {
    // 获取当前日期
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // 月份从0开始，需要加1，并且保证两位数字
    const day = today.getDate().toString().padStart(2, "0"); // 日期，保证两位数字

    // 创建文件夹路径
    const folderPath = path.join(__dirname, "../files", year, month, day);

    // 创建目录（如果不存在）
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // 生成随机文件名
    const randomFileName = `${uuidv4()}.pdf`; // 使用uuid生成随机文件名，你可以根据需要修改文件名的格式
    // 完整的本地文件路径
    const localFilePath = path.join(folderPath, randomFileName);

    http
      .get("http://192.168.0.61/64.pdf", (response: any) => {
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(localFilePath);
          response.pipe(fileStream);

          fileStream.on("finish", () => {
            fileStream.close();
            console.log("文件保存成功" + localFilePath);
            console.log("开始打印", printerName);

            firstImg(localFilePath, folderPath + "/example.pdf").then(
              (outputFilePath) => {
                console.log("文件打印成功", outputFilePath);
                pdfium
                  .printPDF({
                    filePath: outputFilePath,
                    printerName: printerName,
                    dpi: 600,
                    width: 600,
                    height: 1200,
                  })
                  .then(() => {
                    console.log("打印成功");
                  });
              }
            );

            // const inputFilePath = localFilePath; // 替换为你的输入文件路径
            // const outputFilePath = folderPath + "/example.pdf"; // 替换为你的输出文件路径
            // const cropX = 0; // 左边裁剪的点坐标
            // const cropY = 0; // 底部裁剪的点坐标
            // const cropWidth = 310; // 裁剪的宽度
            // const cropHeight = 800; // 裁剪的高度

            // const run = async () => {
            //   // 读取输入 PDF 文件
            //   const existingPdfBytes = fs.readFileSync(inputFilePath);

            //   // 创建一个 PDF 文档对象
            //   const pdfDoc = await PDFDocument.load(existingPdfBytes);
            //   const [firstPage] = pdfDoc.getPages();

            //   // 裁剪页面
            //   firstPage.setSize(cropWidth, cropHeight);
            //   firstPage.setCropBox(0, 0, cropWidth, cropHeight);

            //   // 保存 PDF
            //   const pdfBytes = await pdfDoc.save();
            //   fs.writeFileSync(outputFilePath, pdfBytes);

            //   // pdfium
            //   // .printPDF({
            //   //   filePath: outputFilePath,
            //   //   printerName: printerName,
            //   //   dpi: 600,
            //   //   width: 600,
            //   //   height: 1200,
            //   // })
            //   // .then(() => {
            //   //   console.log("打印成功");
            //   // });
            // };

            // run().catch((error) => console.log(error));
          });
        } else {
          console.error(`请求失败，状态码：${response.statusCode}`);
        }
      })
      .on("error", (err: any) => {
        console.error(`发生错误：${err.message}`);
      });

    ctx.body = {
      message: "打印成功",
    };
  } else {
    ctx.body = {
      message: "文件不存在",
    };
  }
});

router.get("/test", async (ctx: any, next: any) => {
  ctx.body = "Hello Mowang";
});

module.exports = router;
