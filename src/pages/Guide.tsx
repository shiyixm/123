import React, { useEffect, useRef, useState } from 'react';
import { Typography, Steps, Card, Alert, Divider, Button, Layout, Table, Space, Tag, Modal } from 'antd';
import { ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';

const { Title, Paragraph, Text } = Typography;
const { Header, Content } = Layout;

// 初始化 Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral', // 使用更现代的中性主题
  securityLevel: 'loose',
  fontFamily: '"PingFang SC", "Microsoft YaHei", "sans-serif"', // 指定中文字体
});

const MermaidChart: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid" ref={ref} style={{ textAlign: 'center', background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
      {chart}
    </div>
  );
};

const Guide: React.FC = () => {
  const navigate = useNavigate();
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const billingClientParamsColumns = [
    { title: '公共方法', dataIndex: 'name', key: 'name', width: '30%' },
    { title: '作用说明', dataIndex: 'desc', key: 'desc' },
  ];

  const queryParamsColumns = [
    { title: '字段', dataIndex: 'field', key: 'field', width: '30%' },
    { title: '描述', dataIndex: 'desc', key: 'desc' },
  ];

  const launchParamsColumns = [
    { title: '公共方法', dataIndex: 'param', key: 'param', width: '30%' },
    { title: '说明', dataIndex: 'desc', key: 'desc' },
  ];

  const responseCodeColumns = [
    { title: '响应码 (ResponseCode)', dataIndex: 'code', key: 'code', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: '含义', dataIndex: 'meaning', key: 'meaning' },
  ];

  const stepsData = [
    {
      title: 'Step 1: 启动 Billing Client 与连接 Google Play',
      overview: '这是集成的基石。在 v8.0+ 中通过使用新版 Builder 可以启用自动重连功能。你需要建立与 Google Play 商店的通信，只有连接成功后，才能执行后续的查询和购买。',
      content: (
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16, textAlign: 'left' }} align="start">
          <Paragraph>
            使用 <code>BillingClient.newBuilder()</code> 创建实例。Google 建议启用 <code>enableAutoServiceReconnection()</code> 以便处理与 Google Play 的连接丢失情况。
          </Paragraph>
          <Text strong>公共方法 (v8.0+)：</Text>
          <Table 
            bordered
            size="small" 
            pagination={false} 
            dataSource={[
              { key: '1', name: 'setListener(PurchasesUpdatedListener)', desc: '监听所有购买更新（包含应用外购买）。' },
              { key: '2', name: 'enablePendingPurchases()', desc: '必须调用，以支持现金支付等待处理付款。' },
              { key: '3', name: 'enableAutoServiceReconnection()', desc: '【推荐】启用自动服务重连，减少 SERVICE_DISCONNECTED 错误。' },
              { key: '4', name: 'isFeatureSupported(FeatureType.SUBSCRIPTIONS)', desc: '在发起订阅前使用此方法判断设备是否支持订阅功能。' },
              { key: '5', name: 'queryPurchasesAsync()', desc: '启动时查询用户订单，在网络异常或者服务器异常可正常收到订单更新数据，防止漏单，建议在完成与 Google 连接后执行。' },
              { key: '6', name: 'getBillingConfigAsync()', desc: '获取结算配置，用于获取用户当前的国家/地区信息。' },
            ]} 
            columns={billingClientParamsColumns}
          />
          <Text strong>Kotlin 示例代码 (初始化与连接)：</Text>
          <pre style={{ background: '#f6f8fa', color: '#24292e', padding: 16, borderRadius: 8, overflowX: 'auto', border: '1px solid #d1d9e0', width: '100%' }}>
            <code className="language-kotlin">
{`// 1. 初始化
val billingClient = BillingClient.newBuilder(context)
    .setListener(purchasesUpdatedListener)
    .enablePendingPurchases()
    .enableAutoServiceReconnection() // v8+ 推荐
    .build()

// 2. 建立连接
billingClient.startConnection(object : BillingClientStateListener {
    override fun onBillingSetupFinished(billingResult: BillingResult) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
            // 连接成功
            // [重要] 检查是否支持订阅业务
            val response = billingClient.isFeatureSupported(BillingClient.FeatureType.SUBSCRIPTIONS)
            if (response.responseCode == BillingClient.BillingResponseCode.OK) {
                // 设备支持订阅
            }
        }
    }

    override fun onBillingServiceDisconnected() {
        // [异常处理] 与 Google Play 断开连接，建议按需重新尝试
    }
})`}
            </code>
          </pre>
          <Divider dashed style={{ margin: '16px 0', borderColor: '#d1d9e0' }} />
          <Text strong>queryPurchasesAsync 补充说明：</Text>
          <Table 
            bordered
            size="small" 
            pagination={false} 
            style={{ marginTop: 8, marginBottom: 16 }}
            dataSource={[
              { key: '1', name: 'ProductType.SUBS', desc: '传入的主要维度参数，代表限定查询订阅业务的订单数据。' },
            ]} 
            columns={billingClientParamsColumns}
          />
          <Text strong>防漏单与状态恢复逻辑：</Text>
          <div style={{ background: '#fff', padding: '16px 16px 0 16px', borderRadius: 8, border: '1px solid #f0f0f0', marginTop: 8 }}>
            <Steps 
              direction="vertical" 
              size="small" 
              current={-1} 
              items={[
                { 
                  title: '获取未确认订单', 
                  description: '调用 queryPurchasesAsync 获取订单数据，筛选出 purchaseState = PURCHASED 且 isAcknowledged = false 的数据。' 
                },
                { 
                  title: '上报服务器', 
                  description: '将提取到的 purchasetoken & orderId 传输给服务器进行校验。' 
                },
                { 
                  title: '服务器安全校验与下发', 
                  description: '服务器对请求进行校验，参考《漏单处理》，处理完成后通知客户端，服务器执行acknowledge。' 
                }
              ]} 
            />
          </div>
        </Space>
      ),
    },
    {
      title: 'Step 2: 获取订阅商品详情 (Query Subscriptions)',
      overview: '在 v8.0+ 中使用 queryProductDetailsAsync 获取订阅详情。订阅特定的价格和周期信息不再位于 ProductDetails 根层级，而是嵌套在 subscriptionOfferDetails 中。',
      content: (
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16, textAlign: 'left' }} align="start">
          <Paragraph>
            v8.0+ 的回调返回 <code>QueryProductDetailsResult</code>。订阅商品核心信息需通过 <code>productDetails.subscriptionOfferDetails</code> 列表获取。
          </Paragraph>
          <Text strong>订阅相关的关键参数提取：</Text>
          <Table 
            bordered
            size="small" 
            pagination={false} 
            dataSource={[
              { key: '1', field: 'subscriptionOfferDetails', desc: <span>列表，包含 Base Plan 和优惠信息。<a style={{ marginLeft: 8 }} onClick={() => setIsOfferModalOpen(true)}>查看案例</a></span> },
              { key: '2', field: 'basePlanId', desc: '由服务器提供数据，用于在本地列表中匹配具体的订阅方案。' },
              { key: '3', field: 'pricingPhases', desc: '包含具体的价格字符串（formattedPrice）和周期（billingPeriod，如 "P1M"）。' },
              { key: '4', field: 'offerToken', desc: '待定，暂不清楚优惠折扣由哪一方控制。' },
            ]} 
            columns={queryParamsColumns}
          />
          <Text strong>Kotlin 完整示例 (v8.0+ 订阅查询)：</Text>
          <pre style={{ background: '#f6f8fa', color: '#24292e', padding: 16, borderRadius: 8, border: '1px solid #d1d9e0', width: '100%' }}>
            <code className="language-kotlin">
{`val productList = listOf(
    QueryProductDetailsParams.Product.newBuilder()
        .setProductId("premium_sub_monthly")
        .setProductType(BillingClient.ProductType.SUBS)
        .build()
)
val params = QueryProductDetailsParams.newBuilder().setProductList(productList).build()

// v8.0+ 回调接收 QueryProductDetailsResult 对象
billingClient.queryProductDetailsAsync(params) { result: QueryProductDetailsResult ->
    val billingResult = result.billingResult
    val productDetailsList = result.productDetailsList
    
    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList != null) {
        for (productDetails in productDetailsList) {
            // 提取订阅特有信息
            productDetails.subscriptionOfferDetails?.forEach { offerDetails ->
                val basePlanId = offerDetails.basePlanId
                val offerToken = offerDetails.offerToken
                
                // 获取价格和周期 (第一个定价阶段通常是 Base Plan 价格)
                val pricingPhase = offerDetails.pricingPhases.pricingPhaseList.firstOrNull()
                val price = pricingPhase?.formattedPrice // 如 "¥68.00"
                val period = pricingPhase?.billingPeriod // 如 "P1M" (一个月)
                
                // 使用找到的 offerToken 发起支付...
            }
        }
    }
}`}
            </code>
          </pre>
        </Space>
      ),
    },
    {
      title: 'Step 3: 发起支付并处理结果 (Launch Billing Flow)',
      overview: '拉起 Google Play 的原生支付面板。这是用户体验最关键的一步，你需要确保透传正确的商品信息和优惠信息。用户支付完成触发onPurchasesUpdated，并带回一个 List<Purchase>，从 List中得到 purchaseToken。',
      content: (
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16, textAlign: 'left' }} align="start">
          <Table 
            bordered
            size="small" 
            pagination={false} 
            dataSource={[
              { key: '1', param: 'setProductDetails', desc: 'Step 2 中拿到的 ProductDetails 对象。' },
              { key: '2', param: 'setOfferToken', desc: '如果是订阅，必须指定具体优惠计划的 Token。' },
              { key: '3', param: 'setObfuscatedAccountId', desc: '建议传递用户 ID 的哈希值，用于后端对账和防刷。' },
              { key: '4', param: 'BillingFlowParams.SubscriptionUpdateParams.Builder', desc: '用于订阅升级或降级。需通过 setOldPurchaseToken 传入原 purchaseToken，并指定具体的替换模式（ReplacementMode）。同时在 BillingFlowParams.Builder 的 setProductDetailsParamsList 中传入新商品参数。由服务器返回，便于后续升级/降级模式调整。' },
            ]} 
            columns={launchParamsColumns}
            title={() => <Text strong>launchBillingFlow 公共方法及配置说明</Text>}
          />
          <Table 
            bordered
            size="small" 
            pagination={false} 
            dataSource={[
              { key: '1', code: 'OK (0)', meaning: '成功。' },
              { key: '2', code: 'USER_CANCELED (1)', meaning: '用户取消了购买流程。' },
              { key: '3', code: 'SERVICE_UNAVAILABLE (2)', meaning: '网络连接异常或服务不可用。' },
              { key: '4', code: 'BILLING_UNAVAILABLE (3)', meaning: 'API 版本不支持或用户无法购买。' },
              { key: '5', code: 'ITEM_UNAVAILABLE (4)', meaning: '请求的商品不可用。' },
              { key: '6', code: 'DEVELOPER_ERROR (5)', meaning: '参数错误或 API 使用不当。' },
              { key: '7', code: 'ERROR (6)', meaning: 'Google Play 内部错误。' },
              { key: '8', code: 'ITEM_ALREADY_OWNED (7)', meaning: '用户已拥有该商品（无需重复购买）。' },
              { key: '9', code: 'ITEM_NOT_OWNED (8)', meaning: '消耗或查询时发现用户并不拥有该商品。' },
              { key: '10', code: 'NETWORK_ERROR (12)', meaning: '与 Google Play 服务器通信异常。' },
              { key: '11', code: 'SERVICE_DISCONNECTED (-1)', meaning: '已断开连接（应尝试 restartConnection）。' },
            ]} 
            columns={responseCodeColumns}
            title={() => <Text strong>响应码 (ResponseCode)</Text>}
          />
          <Text strong>Kotlin 示例 (首次拉起支付)：</Text>
          <pre style={{ background: '#f6f8fa', color: '#24292e', padding: 16, borderRadius: 8, border: '1px solid #d1d9e0', width: '100%' }}>
            <code className="language-kotlin">
{`val productDetailsParamsList = listOf(
    BillingFlowParams.ProductDetailsParams.newBuilder()
        .setProductDetails(productDetails)
        .setOfferToken(selectedOfferToken)
        .build()
)
val billingFlowParams = BillingFlowParams.newBuilder()
    .setProductDetailsParamsList(productDetailsParamsList)
    .build()

val billingResult = billingClient.launchBillingFlow(activity, billingFlowParams)`}
            </code>
          </pre>
          <Text strong>Kotlin 示例 (订阅套餐升级/降级)：</Text>
          <pre style={{ background: '#f6f8fa', color: '#24292e', padding: 16, borderRadius: 8, border: '1px solid #d1d9e0', width: '100%' }}>
            <code className="language-kotlin">
{`// 1. 构造新商品的 ProductDetailsParams (升级后的商品)
val productDetailsParamsList = listOf(
    BillingFlowParams.ProductDetailsParams.newBuilder()
        .setProductDetails(newProductDetails)
        .setOfferToken(newOfferToken)
        .build()
)

// 2. 构造 SubscriptionUpdateParams (传入原 purchaseToken 和替换模式)
val updateParams = BillingFlowParams.SubscriptionUpdateParams.newBuilder()
    .setOldPurchaseToken(oldPurchaseToken)
    .setSubscriptionReplacementMode(BillingFlowParams.SubscriptionUpdateParams.ReplacementMode.CHARGE_PRORATED_PRICE)
    .build()

// 3. 构造最终拉起参数
val billingFlowParams = BillingFlowParams.newBuilder()
    .setProductDetailsParamsList(productDetailsParamsList)
    .setSubscriptionUpdateParams(updateParams) // 绑定升级/降级参数
    .build()

val billingResult = billingClient.launchBillingFlow(activity, billingFlowParams)`}
            </code>
          </pre>
        </Space>
      ),
    },
    {
      title: 'Step 4: 后端订单校验 (Backend Order Validation)',
      overview: '这是安全漏洞最常出现的地方。严禁在客户端直接判断支付成功。客户端拿到 purchaseToken 后必须发给后端，后端通过 Google Play Developer API 实时拉取订单状态。',
      content: (
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16, textAlign: 'left' }} align="start">
          <Paragraph>
            后端使用 <code>purchases.subscriptionsv2:get</code> (订阅) 接口验证并拉取详细信息。
          </Paragraph>
          <Paragraph>
            <Text strong>服务端核心判断逻辑：</Text> 见流程图（参考正向/反向流程）。
          </Paragraph>
          <Text strong>后端接口完整响应结构 (JSON 示例)：</Text>
          <pre style={{ background: '#f6f8fa', color: '#24292e', padding: 16, borderRadius: 8, border: '1px solid #d1d9e0', width: '100%' }}>
            <code className="language-json">
{`{
  "kind": "androidpublisher#subscriptionPurchaseV2",
  "startTime": "2023-10-27T10:00:00.000Z",
  "regionCode": "US",
  "subscriptionState": "SUBSCRIPTION_STATE_ACTIVE",
  "latestOrderId": "GPA.3312-4456-7789-00123",
  "linkedPurchaseToken": "old_purchase_token_abc123",
  "acknowledgementState": "ACKNOWLEDGED",
  "lineItems": [
    {
      "productId": "premium_sub_monthly",
      "expiryTime": "2023-11-27T10:00:00.000Z",
      "autoRenewingPlan": {
        "autoRenewEnabled": true
      },
      "offerDetails": {
        "basePlanId": "monthly-plan",
        "offerId": "free-trial"
      }
    }
  ],
  "canceledStateContext": {
    "userInitiatedCancellation": {
      "cancelSurveyResult": {
        "reason": "TECHNICAL_ISSUES"
      },
      "cancelTime": "2023-11-05T14:30:00.000Z"
    }
  },
  "pausedStateContext": {
    "expectedResumeTime": "2023-12-05T10:00:00.000Z"
  },
  "externalAccountIdentifiers": {
    "externalAccountId": "user_uuid_456",
    "obfuscatedExternalAccountId": "user_hash_123"
  },
  "testPurchase": {} // 仅测试购买时存在
}`}
            </code>
          </pre>
        </Space>
      ),
    },
    {
      title: 'Step 5: 后端回调处理 (Real-time Developer Notifications)',
      overview: '用户关闭了 App、订阅自动扣款、退款、价格调整等事件，后端需要通过 RTDN (Google Cloud Pub/Sub) 实时感知，而不需要客户端拉取。',
      content: (
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16, textAlign: 'left' }} align="start">
          <Text strong>服务端核心处理逻辑：</Text>
          <div style={{ background: '#fff', padding: '16px', borderRadius: 8, border: '1px solid #f0f0f0', marginTop: 0, marginBottom: 8 }}>
            <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
                            <li style={{ marginBottom: 8 }}><b>新增与确认 (蓝色高亮类型)：</b>收到 <Tag color="blue">RECOVERED</Tag>、<Tag color="blue">RENEWED</Tag>、<Tag color="blue">PURCHASED</Tag>、<Tag color="blue">RESTARTED</Tag> 时，需通过 <code>purchaseToken</code> 向 Google 校验订单。<b>参考订单校验处理逻辑</b></li>
              <li style={{ marginBottom: 0 }}><b>更新过期时间 (其他类型)：</b>收到 <code>CANCELED</code>, <code>IN_GRACE_PERIOD</code>, <code>ON_HOLD</code>, <code>DEFERRED</code>, <code>REVOKED</code>, <code>EXPIRED</code> 等通知时，均需要在本地系统中<b>同步更新该订单的最新的 expiryTime</b>。</li>
            </ul>
          </div>

          <Table 
            bordered
            size="small" 
            pagination={false} 
            title={() => <Text strong>所有订阅通知类型清单 (NotificationType)</Text>}
            columns={[
              { 
                title: '通知类型 (NotificationType)', 
                dataIndex: 'type', 
                key: 'type', 
                width: '45%',
                render: (text: string, record: any) => {
                  const isHighlight = [1, 2, 4, 7].includes(record.code);
                  return isHighlight ? <Tag color="blue" style={{ fontWeight: 'bold' }}>{text}</Tag> : <Tag>{text}</Tag>;
                }
              },
              { title: '中文说明', dataIndex: 'desc', key: 'desc' },
            ]}
            dataSource={[
              { key: '1', code: 1, type: '(1) SUBSCRIPTION_RECOVERED', desc: '订阅已从账号保留状态恢复，或已从暂停状态恢复。' },
              { key: '2', code: 2, type: '(2) SUBSCRIPTION_RENEWED', desc: '活跃的订阅已自动续订。' },
              { key: '3', code: 3, type: '(3) SUBSCRIPTION_CANCELED', desc: '订阅已被自动或自愿取消。当用户主动取消时发送。' },
              { key: '4', code: 4, type: '(4) SUBSCRIPTION_PURCHASED', desc: '购买了全新的订阅。' },
              { key: '5', code: 5, type: '(5) SUBSCRIPTION_ON_HOLD', desc: '订阅已进入账号保留状态 (如果已启用)。' },
              { key: '6', code: 6, type: '(6) SUBSCRIPTION_IN_GRACE_PERIOD', desc: '订阅已进入宽限期 (如果已启用)。' },
              { key: '7', code: 7, type: '(7) SUBSCRIPTION_RESTARTED', desc: '用户在尚未过期时通过 Play 商店恢复了已被取消的订阅。' },
              { key: '9', code: 9, type: '(9) SUBSCRIPTION_DEFERRED', desc: '订阅的续订时间已被后台系统主动延长。' },
              { key: '12', code: 12, type: '(12) SUBSCRIPTION_REVOKED', desc: '在到期之前，订阅权限已被撤销 (例如遇到退款)。' },
              { key: '13', code: 13, type: '(13) SUBSCRIPTION_EXPIRED', desc: '订阅已自然过期失效。' },
            ]} 
          />
          <Text strong style={{ display: 'inline-block', marginTop: 16 }}>RTDN 数据结构 (Base64 解码后)：</Text>
          <pre style={{ background: '#f6f8fa', color: '#24292e', padding: 16, borderRadius: 8, border: '1px solid #d1d9e0', width: '100%' }}>
            <code className="language-json">
{`{
  "version": "1.0",
  "packageName": "com.example.app",
  "eventTimeMillis": "1698391200000",
  "subscriptionNotification": {
    "version": "1.0",
    "notificationType": 2, // 2 = RENEWED
    "purchaseToken": "xyz123abc...",
    "subscriptionId": "premium_sub_monthly"
  }
}`}
            </code>
          </pre>
          <Text strong style={{ display: 'inline-block', marginTop: 16 }}>退款回调 (VoidedPurchaseNotification) 数据结构：</Text>
          <pre style={{ background: '#f6f8fa', color: '#24292e', padding: 16, borderRadius: 8, border: '1px solid #d1d9e0', width: '100%' }}>
            <code className="language-json">
{`{
  "version": "1.0",
  "packageName": "com.example.app",
  "eventTimeMillis": "1698391200000",
  "voidedPurchaseNotification": {
    "purchaseToken": "xyz123abc...",
    "orderId": "GPA.3312-4456-7789-00123",
    "productType": 2, // 1 = inapp (一次性), 2 = subs (订阅)
    "refundType": 1 // 1 = 取消, 2 = 撤销(Revoked)
  }
}`}
            </code>
          </pre>
        </Space>
      ),
    },
    {
      title: 'Step 6: 撤销权限与退款处理 (Revoke & Refund)',
      overview: '当用户通过商店要求退款，或开发者主动通过 purchases.subscriptionsv2:revoke 发起撤销权限及退款时，系统需要安全地收回虚拟权益。',
      content: (
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16, textAlign: 'left' }} align="start">
          <Alert 
            type="warning" 
            message="被动退款通知 (RTDN)" 
            description={
              <div>
                <Text>当退款发生时，后端会接收到 <code>VoidedPurchaseNotification</code>。对于订阅类型，还会伴随收到 <code>notificationType: 12 (REVOKED)</code> 的订阅通知。</Text>
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li><b>处理逻辑</b>：收到后应立即在数据库中将该笔订单标记为无效，并同步撤销对应的应用内权益。</li>
                </ul>
              </div>
            }
            showIcon 
            style={{ marginBottom: 16 }}
          />

          <Paragraph style={{ marginBottom: 0 }}>
            <Text strong>主动撤销 API (purchases.subscriptionsv2:revoke)：</Text>
            <br />
            开发者可以使用此 API 在订阅凭证(purchaseToken)到期前主动撤销其访问权限，并可选择是否为其执行退款策略。
          </Paragraph>

          <Table 
            bordered
            size="small" 
            pagination={false} 
            title={() => <Text strong>Path parameters (路径参数)</Text>}
            columns={queryParamsColumns}
            dataSource={[
              { key: '1', field: 'packageName', desc: 'Android 应用的完整包名标识 (例如：com.example.app)。' },
              { key: '2', field: 'token', desc: '用户购买订阅时产生的唯一凭据 purchaseToken。' },
            ]} 
          />

          <Table 
            bordered
            size="small" 
            pagination={false} 
            title={() => <Text strong>Request body (请求体参数)</Text>}
            columns={queryParamsColumns}
            dataSource={[
              { 
                key: '1', 
                field: 'revocationContext', 
                desc: (
                  <div>
                    撤销上下文对象。用于指定退款策略，包含三个可选对象（通常仅选用其一）：
                    <ul style={{ marginTop: 8, paddingLeft: 20, marginBottom: 0 }}>
                      <li><b>fullRefund</b>: (可选) 用于对订阅中每个商品的最新一次扣费进行全额退款。</li>
                      <li><b>proratedRefund</b>: (可选) 用于根据订阅的剩余时间比例，向用户退还部分已支付金额。以色列，德国，法国，美国（纽约）可以部分退款。</li>
                      <li><b>itemBasedRefund</b>: (可选) 用于在包含附加项 (add-on items) 的订阅中，对指定的特定商品进行退款。</li>
                    </ul>
                  </div>
                ) 
              },
            ]} 
          />
        </Space>
      ),
    },
  ];

  const sequenceDiagram = `
sequenceDiagram
    autonumber
    participant User as 用户 (User)
    participant App as Android 端 (App)
    participant GPS as Google Play 商店
    participant Server as 开发者后端 (Server)
    participant GAPI as Google Developer API

    App->>GPS: startConnection()
    App->>GPS: queryPurchasesAsync() (防漏单检查)
    GPS-->>App: 返回未确认的订单数据 (如有)
    opt 正常购买：如果没有漏单，用户主动发起购买
        App->>Server: 获取待销售产品列表 (Product List)
        Note over App, Server: 最佳实践：动态获取产品 ID 以便后续灵活扩展
        Server-->>App: 返回 ProductID & Type (如: sub_monthly, subs)
        App->>GPS: queryProductDetailsAsync(List<Product>)
        GPS-->>App: 返回商品详情 (包含 OfferToken)
        App->>GPS: launchBillingFlow(OfferToken)
        GPS->>GPS: 用户进行身份验证并确认付款
        GPS-->>App: onPurchasesUpdated (返回 PurchaseToken)
    end

    Note over App, Server: 【流转关键点】无论是防漏单找回的 Token，还是最新购买拿到的 Token，均统一进入以下校验流程
    App->>Server: 发送 PurchaseToken (POST 校验)
    Server->>GAPI: 获取支付状态 (PurchaseToken)
    GAPI-->>Server: 返回订单详细信息 (Expiry, State)
    Server->>Server: 存储订单并下发用户权益
    Server->>GAPI: acknowledge(PurchaseToken) (确认订单)
    GAPI-->>Server: 确认成功
    Server-->>App: 返回业务处理成功 (权益已下发 & 订单已确认)

    Note over User, GAPI: 退款流程 (Refund Flow)
    User->>GPS: 在商店发起退款申请
    GPS->>Server: 发送 RTDN 通知 (VoidedPurchaseNotification)
    Server->>GAPI: get voided purchases (核准退款订单)
    Server->>Server: 数据库标记订单无效并撤销权益
    Server-->>User: 用户权权益已收回 / 退款处理完成
  `;

  return (
    <Layout className="guide-container" style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: 64 }}>
      <style>{`
        .custom-steps .ant-steps-item-title { color: #1a1a1a !important; font-weight: 600 !important; }
        .custom-steps .ant-steps-item-description { color: #555 !important; }
        .highlight-row { background-color: #f0f5ff !important; }
        .custom-steps .ant-steps-item-tail::after { background-color: #e8e8e8 !important; }
        .custom-steps .ant-steps-item-icon { border-color: #002fa7 !important; background: #fff !important; }
        .custom-steps .ant-steps-item-icon .ant-steps-icon { color: #002fa7 !important; font-weight: bold !important; }
        
        .guide-card { border: 1px solid #e8e8e8 !important; background: #fff !important; }
        .guide-card b, .guide-card strong { color: #002fa7 !important; }
        
        code { 
          background: #f1f3f5 !important; 
          color: #d63384 !important; 
          padding: 2px 6px !important; 
          border-radius: 4px !important; 
          font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace !important;
          font-size: 0.9em !important;
        }
        
        pre code {
          background: transparent !important;
          color: #24292e !important;
          padding: 0 !important;
        }
        
        pre {
          background: #f6f8fa !important;
          padding: 20px !important;
          border-radius: 12px !important;
          border: 1px solid #e1e4e8 !important;
          margin: 16px 0 !important;
        }
      `}</style>
      <Header style={{ background: '#002fa7', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/')}
          style={{ fontSize: 16, marginRight: 16, color: '#fff' }}
        >
          返回演示首页
        </Button>
        <Text strong style={{ fontSize: 18, color: '#fff' }}>Google Billing 集成方案详解</Text>
      </Header>

      <Content style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Typography style={{ textAlign: 'left' }}>
          <Title style={{ color: '#1a1a1a', marginBottom: 24, fontSize: '36px', fontWeight: 700, textAlign: 'left' }}>Google Play Billing Integration Guide</Title>
          <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: 64, maxWidth: 900, textAlign: 'left' }}>
            本集成方案基于 <b>Google Play Billing Library v8.0.0+</b>，涵盖了从客户端交互到后端校验的完整闭环。
          </Paragraph>

          <Divider style={{ margin: '48px 0', borderColor: '#e8e8e8', color: '#002fa7', textAlign: 'left' }}>集成时序图 (Interaction Flow)</Divider>
          
          <MermaidChart chart={sequenceDiagram} />

          <Divider style={{ margin: '48px 0', borderColor: '#e8e8e8' }} />

          <Steps
            direction="vertical"
            current={-1}
            className="custom-steps"
            items={stepsData.map((s) => ({
              title: <Text strong style={{ fontSize: 20, color: '#1a1a1a' }}>{s.title}</Text>,
              description: (
                <Card bordered={false} className="guide-card" style={{ marginTop: 16, marginBottom: 56, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16, textAlign: 'left' }}>
                    <InfoCircleOutlined style={{ color: '#002fa7', marginRight: 8, fontSize: 16, marginTop: 4 }} />
                    <Text style={{ textAlign: 'left', lineHeight: '24px', color: '#555' }}>{s.overview}</Text>
                  </div>
                  {s.content}
                </Card>
              ),
            }))}
          />

        </Typography>

      </Content>
      <Modal
        title="subscriptionOfferDetails 数据结构范例"
        open={isOfferModalOpen}
        onCancel={() => setIsOfferModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsOfferModalOpen(false)}>关闭</Button>
        ]}
        width={600}
      >
        <pre style={{ background: '#f6f8fa', color: '#24292e', padding: 16, borderRadius: 8, overflowX: 'auto', border: '1px solid #d1d9e0', margin: 0 }}>
          <code className="language-json">
{`[
  {
    "basePlanId": "monthly-plan",
    "offerId": "free-trial",
    "offerToken": "abc123def456...",
    "offerTags": ["premium_trial"],
    "pricingPhases": {
      "pricingPhaseList": [
        {
          "formattedPrice": "免费",
          "priceAmountMicros": 0,
          "priceCurrencyCode": "CNY",
          "billingPeriod": "P1M",
          "billingCycleCount": 1,
          "recurrenceMode": 2 // FINITE_RECURRING
        },
        {
          "formattedPrice": "¥68.00",
          "priceAmountMicros": 68000000,
          "priceCurrencyCode": "CNY",
          "billingPeriod": "P1M",
          "billingCycleCount": 0,
          "recurrenceMode": 1 // INFINITE_RECURRING
        }
      ]
    }
  }
]`}
          </code>
        </pre>
      </Modal>
    </Layout>
  );
};

export default Guide;

