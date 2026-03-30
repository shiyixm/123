/**
 * Google Apps Script (GAS) for Google Billing Library Integration Demo.
 * 部署说明：
 * 1. 在 Google Sheets 中点击 `扩展程序` -> `Apps脚本`。
 * 2. 将此代码粘贴进去。
 * 3. 确保你的 Google Sheets 包含名为“套餐”和“订单”的工作表。
 *    - “套餐”包含字段：[产品 ID, 产品标题, 产品价格, 产品描述] (首行作为表头)
 *    - “订单”包含字段：[订单 ID, 产品 ID, 订单信息] (首行作为表头)
 * 4. 点击 `部署` -> `新建部署` -> 选 `Web 应用`。
 * 5. 执行者选 `我`，访问权限选 `所有人`，复制返回的 Web App URL。
 */

const PLANS_SHEET_NAME = '套餐';
const ORDERS_SHEET_NAME = '订单';

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PLANS_SHEET_NAME);
    if (!sheet) {
      throw new Error("找不到名为 '套餐' 的工作表");
    }
    
    const data = sheet.getDataRange().getValues();
    const plans = [];
    
    // 跳过表头 (i=1 开始)
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue; // 忽略空行
      plans.push({
        id: data[i][0],
        title: data[i][1],
        price: data[i][2],
        description: data[i][3]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: plans }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const orderId = requestData.orderId || ('ORDER_' + new Date().getTime());
    const productId = requestData.productId;
    const orderInfo = JSON.stringify(requestData.orderInfo || {});

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ORDERS_SHEET_NAME);
    if (!sheet) {
      throw new Error("找不到名为 '订单' 的工作表");
    }
    
    sheet.appendRow([orderId, productId, orderInfo]);

    return ContentService.createTextOutput(JSON.stringify({ success: true, orderId: orderId }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
       .setMimeType(ContentService.MimeType.JSON);
  }
}

// 移除前端跨域预检处理，由 GAS 纯文本简单请求自主绕过。
