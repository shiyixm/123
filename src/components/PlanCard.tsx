import React from 'react';
import { Card, Button, Typography, Tag, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface PlanData {
  id: string;
  title: string;
  price: string;
  description: string;
}

interface PlanCardProps {
  plan: PlanData;
  onSelect: (plan: PlanData) => void;
  isPopular?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isPopular }) => {
  return (
    <Card 
      hoverable 
      style={{ 
        borderRadius: 12, 
        border: isPopular ? '2px solid #1677ff' : '1px solid #f0f0f0',
        position: 'relative'
      }}
      bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {isPopular && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
          <Tag color="blue" style={{ margin: 0, padding: '2px 12px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
            最受欢迎
          </Tag>
        </div>
      )}
      
      <div className="card-title">
        <Title level={4} style={{ margin: 0 }}>{plan.title}</Title>
        <Tag color="geekblue">{plan.id}</Tag>
      </div>
      
      <div className="plan-price">
        {plan.price}
      </div>
      
      <Paragraph className="plan-desc">
        {plan.description}
      </Paragraph>

      <Space direction="vertical" style={{ marginTop: 'auto', marginBottom: 24 }}>
        <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> 多设备同步无缝切换</Text>
        <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> 获取最新的高级功能</Text>
        <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> 优先客服技术支持</Text>
      </Space>

      <Button 
        type={isPopular ? "primary" : "default"} 
        size="large" 
        block 
        onClick={() => onSelect(plan)}
      >
        选择此套餐
      </Button>
    </Card>
  );
};

export default PlanCard;
