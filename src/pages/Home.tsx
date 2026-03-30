import React, { useEffect, useState } from 'react';
import { Typography, Spin, Alert, Button, message, Layout } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PlanCard from '../components/PlanCard';
import CheckoutModal from '../components/CheckoutModal';

const { Title, Paragraph } = Typography;
const { Footer } = Layout;

const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      if (!GAS_URL || GAS_URL.includes('YOUR_MACRO_ID')) {
         // Mock data if environment is not set correctly or during development
         setTimeout(() => {
            setPlans([
              { id: 'ring_sub_basic', title: '基础睡眠监测', price: '¥15.00/月', description: '提供准确的夜间睡眠分期、心率和血氧趋势的基础日度报告。' },
              { id: 'ring_sub_pro', title: '进阶健康看护', price: '¥39.00/月', description: '包含基础版功能，额外提供全天压力监测、运动恢复建议及异常心率预警。' },
              { id: 'ring_sub_premium', title: '尊享私人顾问', price: '¥298.00/年', description: '享受年度折扣！解锁 AI 驱动的定制化健康周报、专属营养指导及家人健康数据共享功能。' }
            ]);
            setLoading(false);
         }, 1000);
         return;
      }

      // 为了处理 GAS的 CORS 重定向限制，这里我们简单发一个GET请求。
      const response = await fetch(GAS_URL);
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data.slice(0, 3)); // 要求载入3个套餐
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setError('网络请求失败，若尚未配置 GAS 请检查 .env 设置。目前将加载模拟数据...');
      
      // Fallback 模拟数据
      setPlans([
        { id: 'ring_sub_basic', title: '基础睡眠监测', price: '¥15.00/月', description: '提供准确的夜间睡眠分期、心率和血氧趋势的基础日度报告。' },
        { id: 'ring_sub_pro', title: '进阶健康看护', price: '¥39.00/月', description: '包含基础版功能，额外提供全天压力监测、运动恢复建议及异常心率预警。' },
        { id: 'ring_sub_premium', title: '尊享私人顾问', price: '¥298.00/年', description: '享受年度折扣！解锁 AI 驱动的定制化健康周报、专属营养指导及家人健康数据共享功能。' }
      ]);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleOrderSuccess = async (orderData: any) => {
    setIsModalOpen(false);
    message.success(`应用内购买成功! 订单号: ${orderData.orderId}`);
    
    // 异步推送到 GAS（后台运行）
    if (GAS_URL && !GAS_URL.includes('YOUR_MACRO_ID')) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify(orderData),
          headers: {
            'Content-Type': 'text/plain;charset=utf-8', // GAS 偏好的无CORS预检类型
          }
        });
        message.info('订单已同步至 Google Sheets 🚀');
      } catch (err) {
        console.error('同步订单失败', err);
        message.warning('订单保存至 Google Sheets 失败，请检查配置。');
      }
    } else {
      setTimeout(() => {
        message.info('(模拟) 订单已存储至 Google Sheets: ' + orderData.orderId);
      }, 1000);
    }
  };

  return (
    <div className="home-container">
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={1}>解锁高级体验 👋</Title>
        <Paragraph style={{ fontSize: 18, color: '#666' }}>
          选择适合您的订阅套餐。由 Google Billing Library 安全驱动。
        </Paragraph>
      </div>

      {error && <Alert type="warning" message={error} style={{ marginBottom: 24 }} />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="正在从 Google Sheets 加载套餐..." />
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan, index) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onSelect={handlePlanSelect} 
              isPopular={index === 1} // 居中的设为推荐
            />
          ))}
        </div>
      )}

      {selectedPlan && (
        <CheckoutModal 
          open={isModalOpen} 
          plan={selectedPlan} 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={handleOrderSuccess} 
        />
      )}

      <Footer style={{ textAlign: 'center', background: 'transparent', marginTop: 80, padding: '24px 0' }}>
        <Button 
          type="dashed" 
          icon={<BookOutlined />} 
          size="large" 
          onClick={() => navigate('/guide')}
        >
          查看完整 Google Billing 集成方案
        </Button>
      </Footer>
    </div>
  );
};

export default Home;
