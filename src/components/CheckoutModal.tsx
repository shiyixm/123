import React, { useState } from 'react';
import { Modal, Typography, Button, Divider, Space, message } from 'antd';
import { GoogleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface CheckoutModalProps {
  open: boolean;
  onCancel: () => void;
  plan: any;
  onSuccess: (orderData: any) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ open, onCancel, plan, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // 模拟真实的拉起支付和回调等待
    setTimeout(async () => {
      // 创建模拟订单数据
      const orderData = {
        orderId: `GPA.${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
        productId: plan?.id || 'unknown',
        orderInfo: {
          purchaseTime: new Date().getTime(),
          purchaseState: 0,
          purchaseToken: 'mock_purchase_token_for_validation_' + Math.random().toString(36).substring(7),
          autoRenewing: true
        }
      };

      message.success('支付成功，正在处理订单...');
      await onSuccess(orderData);
      setLoading(false);
    }, 1500);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
      closable={!loading}
      maskClosable={!loading}
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <GoogleOutlined style={{ fontSize: 24, color: '#34a853' }} />
          <Title level={4} style={{ margin: 0 }}>Google Play</Title>
        </Space>
        
        <Divider />
        
        {plan && (
          <div style={{ textAlign: 'left' }}>
            <Title level={5}>{plan.title}</Title>
            <Text type="secondary">{plan.description}</Text>
            
            <div style={{ marginTop: 24, padding: '16px', background: '#f5f5f5', borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>价格:</Text>
                  <Text strong>{plan.price}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>续费方式:</Text>
                  <Text>30 天之后自动扣款</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>取消政策:</Text>
                  <Text>随时可取消</Text>
                </div>
              </Space>
            </div>
            
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>由 Google Play 处理的安全付款</Text>
            </div>
          </div>
        )}

        <Divider style={{ margin: '24px 0 16px 0' }} />
        
        <Button 
          type="primary" 
          block 
          size="large" 
          onClick={handleSubscribe} 
          loading={loading}
          style={{ background: '#00875f' }} // Google Playish Green
        >
          {loading ? '处理中...' : '订阅 (Subscribe)'}
        </Button>
      </div>
    </Modal>
  );
};

export default CheckoutModal;
