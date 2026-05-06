import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackgroundEffect from '../components/layout/BackgroundEffect';
import WelcomePanel from '../components/home/WelcomePanel';
import LoginFlow from '../components/home/LoginFlow';

export default function Home() {
  const navigate = useNavigate();
  const [selectedSchool, setSelectedSchool] = useState(null);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #050c1a 0%, #070d1e 40%, #050a18 100%)',
      }}
    >
      <BackgroundEffect />

      <Header onAdvancedLogin={() => navigate('/register')} />

      <div className="relative z-10 flex flex-1 min-h-0 flex-col lg:flex-row">
        <WelcomePanel selectedSchool={selectedSchool} />
        <LoginFlow onSchoolChange={setSelectedSchool} />
      </div>

      <Footer />
    </div>
  );
}