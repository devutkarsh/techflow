import React, { useState, useEffect, useCallback } from 'react';
import { getAllArchitectures } from './data/catalog';
import type { ArchitectureNodeData } from './types/architecture';
import { HeaderNav } from './components/layout/HeaderNav';
import { DiagramCanvas } from './components/diagram/DiagramCanvas';
import { NodeInspector } from './components/layout/NodeInspector';
import { SimulationBar } from './components/layout/SimulationBar';
import { ArchitectureDocs } from './components/layout/ArchitectureDocs';

export const App: React.FC = () => {
  const architectures = getAllArchitectures();

  // Parse initial chapter index from clean path (e.g. /github-pages-static-hugo), URL hash (#/...), or search params (?chapter=...)
  const getInitialIndex = (): number => {
    const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    const params = new URLSearchParams(window.location.search);
    const targetSlug = cleanPath || params.get('chapter') || hash;
    if (targetSlug) {
      const foundIdx = architectures.findIndex(
        (a) => a.slug.toLowerCase() === targetSlug.toLowerCase() || a.id.toLowerCase() === targetSlug.toLowerCase()
      );
      if (foundIdx !== -1) return foundIdx;
    }
    return 0;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(getInitialIndex);
  const [selectedNode, setSelectedNode] = useState<ArchitectureNodeData | null>(null);
  
  // Viewport & Simulation State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [isSimPlaying, setIsSimPlaying] = useState(false);

  const currentArchitecture = architectures[currentIndex] || architectures[0];

  // Reset simulation when switching architecture chapter
  const handleNavigateIndex = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    setSelectedNode(null);
    setIsSimulating(false);
    setIsSimPlaying(false);
    setSimStepIndex(0);
  }, []);

  // Synchronize clean URL pathname & document title whenever active chapter changes
  useEffect(() => {
    if (currentArchitecture) {
      const targetPath = `/${currentArchitecture.slug}`;
      if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, '', targetPath);
      }
      document.title = `${currentArchitecture.title} | TechFlow Architecture Book`;
    }
  }, [currentArchitecture]);

  // Handle browser Back/Forward navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const targetSlug = cleanPath || hash;
      if (targetSlug) {
        const foundIdx = architectures.findIndex(
          (a) => a.slug.toLowerCase() === targetSlug.toLowerCase() || a.id.toLowerCase() === targetSlug.toLowerCase()
        );
        if (foundIdx !== -1 && foundIdx !== currentIndex) {
          handleNavigateIndex(foundIdx);
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [architectures, currentIndex, handleNavigateIndex]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        if (currentIndex < architectures.length - 1) {
          handleNavigateIndex(currentIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          handleNavigateIndex(currentIndex - 1);
        }
      } else if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) {
        setIsSimulating((prev) => !prev);
      } else if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSelectedNode(null);
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, architectures.length, handleNavigateIndex]);

  // Simulation Controls
  const toggleSimulation = () => {
    if (!isSimulating) {
      setIsSimulating(true);
      setSimStepIndex(0);
      setIsSimPlaying(true);
    } else {
      setIsSimulating(false);
      setIsSimPlaying(false);
    }
  };

  const handleNextSimStep = () => {
    const maxSteps = currentArchitecture.simulationFlow?.length || 1;
    if (simStepIndex < maxSteps - 1) {
      setSimStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevSimStep = () => {
    if (simStepIndex > 0) {
      setSimStepIndex((prev) => prev - 1);
    }
  };

  const handleResetSim = () => {
    setSimStepIndex(0);
  };

  const handleSelectSimStep = (stepIdx: number) => {
    setIsSimulating(true);
    setSimStepIndex(stepIdx);
  };

  const handleSelectNode = (node: ArchitectureNodeData | null) => {
    setSelectedNode(node);
  };

  const handleSelectNodeById = (nodeId: string) => {
    const found = currentArchitecture.nodes.find((n) => n.id === nodeId);
    if (found) {
      setSelectedNode(found.data);
    }
  };

  const activeSimStepNumber = isSimulating && currentArchitecture.simulationFlow ? simStepIndex + 1 : null;

  return (
    <div className="center-app-layout">
      <div className="center-content-wrapper">
        {/* Centered Top Hierarchy: Heading -> Stepper -> Title/Desc/Author -> Simulate/Read Docs */}
        <HeaderNav
          architectures={architectures}
          currentIndex={currentIndex}
          onNavigateIndex={handleNavigateIndex}
          isSimulating={isSimulating}
          onToggleSimulation={toggleSimulation}
        />

        {/* Centered Diagram Canvas Frame */}
        <div className="center-diagram-frame">
          <DiagramCanvas
            architecture={currentArchitecture}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={handleSelectNode}
            activeSimulationStep={activeSimStepNumber}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />

          {/* Floating Request Simulation Bar */}
          {isSimulating && currentArchitecture.simulationFlow && (
            <SimulationBar
              steps={currentArchitecture.simulationFlow}
              currentStepIndex={simStepIndex}
              isPlaying={isSimPlaying}
              onTogglePlay={() => setIsSimPlaying(!isSimPlaying)}
              onNextStep={handleNextSimStep}
              onPrevStep={handlePrevSimStep}
              onReset={handleResetSim}
              onSelectStepIndex={(idx) => setSimStepIndex(idx)}
              onClose={() => setIsSimulating(false)}
            />
          )}
        </div>

        {/* Deep Dive Architecture Documentation Tabs */}
        {!isFullscreen && (
          <ArchitectureDocs
            architecture={currentArchitecture}
            onSelectSimulationStep={handleSelectSimStep}
          />
        )}
      </div>

      {/* Slide-out Component Inspector Drawer */}
      <NodeInspector
        node={selectedNode}
        architecture={currentArchitecture}
        onClose={() => setSelectedNode(null)}
        onSelectNodeById={handleSelectNodeById}
      />
    </div>
  );
};

export default App;
