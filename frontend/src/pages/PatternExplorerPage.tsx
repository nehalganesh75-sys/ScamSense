import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Network,
  Search,
  Filter,
  Info,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Tag,
  Building,
  Globe,
  Radio,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { PatternGraphData, GraphNode, GraphEdge } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';

export const PatternExplorerPage: React.FC = () => {
  const [graphData, setGraphData] = useState<PatternGraphData>({ nodes: [], edges: [] });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getPatternGraph(selectedCategory, searchQuery)
      .then((data) => {
        setGraphData(data);
        if (data.nodes.length > 0 && !selectedNode) {
          setSelectedNode(data.nodes[0]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery]);

  // Compute fixed 2D layout coordinates for nodes deterministically
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const count = graphData.nodes.length;
    if (count === 0) return positions;

    // Distribute nodes in concentric orbits by node type
    const campaigns = graphData.nodes.filter(n => n.type === 'campaign');
    const entities = graphData.nodes.filter(n => n.type === 'entity');
    const domains = graphData.nodes.filter(n => n.type === 'domain' || n.type === 'channel' || n.type === 'tactic');

    const centerX = 450;
    const centerY = 320;

    // Center orbit: Campaigns
    campaigns.forEach((node, i) => {
      const angle = (2 * Math.PI / Math.max(1, campaigns.length)) * i - Math.PI / 2;
      positions[node.id] = {
        x: centerX + 170 * Math.cos(angle),
        y: centerY + 130 * Math.sin(angle),
      };
    });

    // Outer orbit: Entities & Impersonations
    entities.forEach((node, i) => {
      const angle = (2 * Math.PI / Math.max(1, entities.length)) * i;
      positions[node.id] = {
        x: centerX + 340 * Math.cos(angle),
        y: centerY + 220 * Math.sin(angle),
      };
    });

    // Exterior orbit: Domains, tactics, and channels
    domains.forEach((node, i) => {
      const angle = (2 * Math.PI / Math.max(1, domains.length)) * i + 0.4;
      positions[node.id] = {
        x: centerX + 460 * Math.cos(angle),
        y: centerY + 290 * Math.sin(angle),
      };
    });

    return positions;
  }, [graphData]);

  // Connected nodes map for highlighting
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const ids = new Set<string>();
    ids.add(selectedNode.id);
    graphData.edges.forEach(e => {
      if (e.source === selectedNode.id) ids.add(e.target);
      if (e.target === selectedNode.id) ids.add(e.source);
    });
    return ids;
  }, [selectedNode, graphData]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getNodeColor = (type: string, isSelected: boolean) => {
    if (isSelected) return '#06B6D4'; // Bright cyan
    switch (type) {
      case 'campaign':
        return '#EF4444'; // Red
      case 'entity':
        return '#6366F1'; // Indigo
      case 'domain':
        return '#F59E0B'; // Amber
      case 'channel':
        return '#10B981'; // Emerald
      default:
        return '#8B5CF6'; // Purple
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return ShieldAlert;
      case 'entity':
        return Building;
      case 'domain':
        return Globe;
      case 'channel':
        return Radio;
      default:
        return Zap;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <Network className="w-4 h-4" />
            <span>Relational Intelligence Visualization</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono">
            Fictional Demonstration Topology Dataset
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Scam Pattern Explorer</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Visualize syndication links connecting phishing campaigns, spoofed brand entities, throwaway domains, and delivery channels.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Patterns' },
            { id: 'job_internship', label: 'Job & Internship' },
            { id: 'law_enforcement', label: 'Digital Arrest' },
            { id: 'banking', label: 'Banking Phishing' },
            { id: 'courier_logistics', label: 'Logistics' },
            { id: 'utility', label: 'Utility Cutoff' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns or domains..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Graph Area & Node Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive SVG Canvas (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative min-h-[580px] flex flex-col">
          {/* Canvas Controls Overlay */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1 backdrop-blur-sm">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Reset Position"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] backdrop-blur-sm">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Campaign
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Spoofed Entity
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Malicious Domain
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Channel
            </span>
          </div>

          {/* Graph Interactive Surface */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`w-full h-full flex-1 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
            style={{ userSelect: 'none' }}
          >
            {graphData.nodes.length === 0 && !isLoading ? (
              <div className="h-full flex items-center justify-center p-8">
                <EmptyState
                  title="No Matching Graph Patterns"
                  description="Try adjusting your category filter or search terms."
                />
              </div>
            ) : (
              <svg width="100%" height="580" className="w-full h-full">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="20"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#475569" />
                  </marker>
                  <marker
                    id="arrowhead-highlight"
                    markerWidth="8"
                    markerHeight="6"
                    refX="20"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#06B6D4" />
                  </marker>
                </defs>

                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  {/* Edges */}
                  {graphData.edges.map((edge) => {
                    const src = nodePositions[edge.source];
                    const dst = nodePositions[edge.target];
                    if (!src || !dst) return null;

                    const isHighlighted =
                      selectedNode &&
                      (edge.source === selectedNode.id || edge.target === selectedNode.id);

                    const midX = (src.x + dst.x) / 2;
                    const midY = (src.y + dst.y) / 2;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={dst.x}
                          y2={dst.y}
                          stroke={isHighlighted ? '#06B6D4' : '#334155'}
                          strokeWidth={isHighlighted ? 2.5 : 1.2}
                          strokeDasharray={isHighlighted ? 'none' : '4,4'}
                          markerEnd={isHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
                          opacity={isHighlighted ? 1 : 0.6}
                        />
                        {isHighlighted && (
                          <text
                            x={midX}
                            y={midY - 6}
                            fill="#06B6D4"
                            fontSize="10"
                            textAnchor="middle"
                            fontFamily="monospace"
                            className="pointer-events-none"
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {graphData.nodes.map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;

                    const isSelected = selectedNode?.id === node.id;
                    const isConnected = connectedNodeIds.has(node.id);
                    const color = getNodeColor(node.type, isSelected);

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Glow halo for selected */}
                        {isSelected && (
                          <circle
                            r="28"
                            fill="none"
                            stroke="#06B6D4"
                            strokeWidth="2"
                            strokeOpacity="0.4"
                            className="animate-pulse"
                          />
                        )}

                        <circle
                          r={isSelected ? 20 : 16}
                          fill="#0F172A"
                          stroke={color}
                          strokeWidth={isSelected ? 3 : (isConnected ? 2 : 1)}
                          style={{
                            transition: 'all 0.2s ease',
                            filter: isSelected ? 'drop-shadow(0 0 8px rgba(6,182,212,0.4))' : 'none',
                          }}
                        />

                        {/* Node Label */}
                        <text
                          y={isSelected ? 34 : 28}
                          fill={isSelected ? '#FFFFFF' : (isConnected ? '#E2E8F0' : '#94A3B8')}
                          fontSize={isSelected ? '12' : '11'}
                          fontWeight={isSelected ? '600' : '400'}
                          textAnchor="middle"
                          className="pointer-events-none font-sans"
                        >
                          {node.label.length > 22 ? node.label.substring(0, 20) + '...' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>
        </div>

        {/* Selected Node Details Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1.5 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                    {selectedNode.type}
                  </span>
                  {selectedNode.risk_level && (
                    <RiskBadge assessment={selectedNode.risk_level} size="sm" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white pt-1">{selectedNode.label}</h3>
                <span className="text-xs text-slate-400 font-mono block">ID: {selectedNode.id}</span>
              </div>

              {/* Node Detail Attributes */}
              <div className="space-y-3 text-xs">
                {selectedNode.details.description && (
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-300">Campaign Profile:</span>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {selectedNode.details.description}
                    </p>
                  </div>
                )}

                {selectedNode.details.tactics && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-300">Observed Tactics:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.details.tactics.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.details.detected_flags && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-300">Flagged Infrastructure:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.details.detected_flags.map((flag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 text-[10px] border border-red-800/60 font-mono">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.details.official_portal && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Genuine Official Contact:</span>
                    <span className="text-cyan-400 font-mono font-medium">{selectedNode.details.official_portal}</span>
                  </div>
                )}
              </div>

              {/* Connected Relationships */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Linked Topology ({connectedNodeIds.size - 1})</span>
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {graphData.edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge) => {
                      const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                      const otherNode = graphData.nodes.find(n => n.id === otherId);
                      return (
                        <div
                          key={edge.id}
                          onClick={() => otherNode && setSelectedNode(otherNode)}
                          className="p-2 rounded bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="truncate pr-2">
                            <span className="text-[10px] text-slate-500 font-mono block">{edge.relationship}</span>
                            <span className="text-slate-200 font-medium">{otherNode?.label || otherId}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 text-center text-xs text-slate-500">
              Click any node in the pattern graph to inspect its attributes, campaign profile, and connected infrastructure.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
