import { useState } from 'react';
import { Sidebar, MobileHeader, type ModuleKey } from '@/components/Sidebar';
import { Diretoria } from '@/modules/Diretoria';
import { Comercial } from '@/modules/Comercial';
import { Atendimento } from '@/modules/Atendimento';
import { Financeiro } from '@/modules/Financeiro';
import { Administracao } from '@/modules/Administracao';
import { Marketing } from '@/modules/Marketing';

function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('diretoria');
  const [mobileOpen, setMobileOpen] = useState(false);

  function renderModule() {
    switch (activeModule) {
      case 'diretoria': return <Diretoria />;
      case 'comercial': return <Comercial />;
      case 'atendimento': return <Atendimento />;
      case 'financeiro': return <Financeiro />;
      case 'administracao': return <Administracao />;
      case 'marketing': return <Marketing />;
      default: return <Diretoria />;
    }
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <Sidebar
        active={activeModule}
        onNavigate={setActiveModule}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
      />

      <div className="lg:pl-72">
        <MobileHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="h-[calc(100vh-3.5rem)] p-4 lg:h-screen lg:p-6">
          <div key={activeModule} className="animate-fade-in h-full">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
