'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GameAsset, Project } from '@/types/gameforge';
import { getStoredProjects, getStoredAssets, saveProjects } from '@/lib/store';
import { LayoutDashboard, Wand2, Layers, FolderKanban, Plus, ExternalLink, Sparkles, Image as ImageIcon, ShieldCheck, Zap, ArrowUpRight, Search, Tag, Settings, CloudUpload, Heart } from 'lucide-react';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // New Project form state
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjEngine, setNewProjEngine] = useState<'Unity' | 'Unreal Engine' | 'Godot' | 'WebGPU/Three.js'>('Unity');

  useEffect(() => {
    const projs = getStoredProjects();
    const asts = getStoredAssets();
    setProjects(projs);
    setAssets(asts);
    if (projs.length > 0) {
      setSelectedProjectId(projs[0].id);
    }
  }, []);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const projectAssets = assets.filter(a => a.projectId === selectedProjectId);

  // Truthful stats — count only user-generated assets (not mock data)
  const userGeneratedAssets = assets.filter(a => a.provider && a.provider !== undefined);
  const cloudinaryAssets = assets.filter(a => a.cloudinaryUploaded);
  const favoriteAssets = assets.filter(a => a.isFavorite);
  const totalUserAssets = assets.filter(a => !['asset-kungfu-panda','asset-cyber-warrior','asset-dragon-lord','asset-scifi-city','asset-scifi-blaster','asset-health-potion'].includes(a.id));

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjName,
      description: newProjDesc || 'Indie game project asset container.',
      gameEngine: newProjEngine,
      assetCount: 0,
      characterCount: 0,
      environmentCount: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newProj, ...projects];
    setProjects(updated);
    saveProjects(updated);
    setSelectedProjectId(newProj.id);
    setIsCreatingProject(false);
    setNewProjName('');
    setNewProjDesc('');
  };

  // Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TOP DASHBOARD HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800/80"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest">
              <LayoutDashboard className="w-4 h-4" />
              <span>Indie Studio Hub</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              GameForge Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your game projects, Cloudinary media pipeline, and AI generated assets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsCreatingProject(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>+ New Project</span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/generator"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>+ New Asset</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* MODAL: CREATE PROJECT */}
        <AnimatePresence>
          {isCreatingProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              >
                <h3 className="text-xl font-bold text-white">Create Game Project</h3>
                <p className="text-xs text-slate-400 mb-4">Group assets by game title and target engine.</p>

                <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Project Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cyberpunk RPG 2099"
                      value={newProjName}
                      onChange={(e) => setNewProjName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Game Engine Target</label>
                    <select
                      value={newProjEngine}
                      onChange={(e: any) => setNewProjEngine(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500 text-sm font-medium"
                    >
                      <option value="Unity">Unity 3D / 2D</option>
                      <option value="Unreal Engine">Unreal Engine 5</option>
                      <option value="Godot">Godot Engine</option>
                      <option value="WebGPU/Three.js">WebGPU / Three.js</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Brief description of the game concept..."
                      value={newProjDesc}
                      onChange={(e) => setNewProjDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreatingProject(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                    >
                      Save Project
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN DASHBOARD LAYOUT (SIDEBAR + ACTIVE PROJECT DISPLAY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* LEFT SIDEBAR: PROJECTS LIST */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-cyan-400" />
                  Your Projects ({projects.length})
                </h2>
              </div>

              <div className="space-y-3">
                {projects.map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white">{p.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-500/30">
                          {p.gameEngine}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                        <span>{p.assetCount} Total Assets</span>
                        <span className="text-emerald-400 font-semibold">Cloudinary Sync ✓</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Truthful session stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/20 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>Your Session Stats</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />Generated Assets</span>
                  <span className="font-bold text-white">{totalUserAssets.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5"><CloudUpload className="w-3.5 h-3.5" />Cloudinary Uploads</span>
                  <span className={`font-bold ${cloudinaryAssets.length > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {cloudinaryAssets.length > 0 ? cloudinaryAssets.length : 'None (configure env vars)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" />Favorites</span>
                  <span className="font-bold text-pink-400">{favoriteAssets.length}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to enable real Cloudinary pipeline.
              </p>
            </motion.div>
          </div>

          {/* RIGHT CONTENT: ACTIVE PROJECT OVERVIEW & ASSET GRID */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ACTIVE PROJECT BANNER */}
            {activeProject && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{activeProject.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-bold">
                        {activeProject.gameEngine}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1 max-w-xl">{activeProject.description}</p>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={`/generator?project=${activeProject.id}`}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Generate in {activeProject.name}</span>
                    </Link>
                  </motion.div>
                </div>

                {/* METRICS ROW — real counts from localStorage */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 font-medium">Project Assets</span>
                    <p className="text-2xl font-extrabold text-white mt-1">{projectAssets.length}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">in this project</p>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 font-medium">Characters</span>
                    <p className="text-2xl font-extrabold text-cyan-400 mt-1">
                      {projectAssets.filter(a => a.assetType === 'Character').length}
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 font-medium">Environments</span>
                    <p className="text-2xl font-extrabold text-purple-400 mt-1">
                      {projectAssets.filter(a => a.assetType === 'Environment').length}
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 font-medium">Cloudinary</span>
                    <p className="text-xs font-bold mt-2 flex items-center gap-1">
                      {projectAssets.some(a => a.cloudinaryUploaded)
                        ? <><ShieldCheck className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Pipeline Active</span></>
                        : <><CloudUpload className="w-4 h-4 text-slate-500" /><span className="text-slate-500">Not configured</span></>
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ASSET GRID SECTION */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    Project Assets ({projectAssets.length})
                  </h3>
                  <p className="text-xs text-slate-400">Click any asset to launch Cloudinary Transformation Studio.</p>
                </div>

                <Link
                  href="/library"
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <span>View Full Library</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {projectAssets.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
                  <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-300 font-bold">No assets in this project yet</p>
                  <p className="text-xs text-slate-500">Generate your first AI game asset or asset pack now.</p>
                  <Link
                    href="/generator"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Asset</span>
                  </Link>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {projectAssets.map((asset) => (
                    <motion.div key={asset.id} variants={itemVariants} whileHover={{ y: -6 }}>
                      <Link
                        href={`/asset/${asset.id}`}
                        className="group bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-cyan-500/60 transition-all overflow-hidden glow-card flex flex-col h-full shadow-lg"
                      >
                        {/* Thumbnail Container */}
                        <div className="relative aspect-square bg-slate-900 overflow-hidden flex items-center justify-center">
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Cloudinary Tags Overlay */}
                          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded bg-slate-900/90 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">
                              {asset.assetType}
                            </span>
                            {asset.isPack && (
                              <span className="px-2 py-0.5 rounded bg-purple-900/90 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                                Pack
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-slate-300 border border-slate-800">
                            Cloudinary f_auto
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">
                              {asset.name}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1 italic">
                              "{asset.prompt}"
                            </p>
                          </div>

                          {/* Tags list */}
                          <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                            {asset.tags.slice(0, 3).map((t, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
