'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GameAsset, Project, AssetType } from '@/types/gameforge';
import { getStoredAssets, getStoredProjects } from '@/lib/store';
import { Layers, Search, Filter, Wand2, Grid, List, Tag, Sparkles, ExternalLink, Image as ImageIcon, Heart, SortAsc, CloudUpload } from 'lucide-react';

export default function LibraryPage() {
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [cloudinaryOnly, setCloudinaryOnly] = useState(false);

  useEffect(() => {
    setAssets(getStoredAssets());
    setProjects(getStoredProjects());
  }, []);

  const categories = ['all', 'Character', 'Environment', 'Item/Prop', 'UI/Icon', 'Texture'];

  const filteredAssets = assets
    .filter((asset) => {
      const matchesSearch =
        searchQuery === '' ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesProject = selectedProjectId === 'all' || asset.projectId === selectedProjectId;
      const matchesCategory = selectedCategory === 'all' || asset.assetType === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || asset.isFavorite;
      const matchesCloudinary = !cloudinaryOnly || asset.cloudinaryUploaded;

      return matchesSearch && matchesProject && matchesCategory && matchesFavorites && matchesCloudinary;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TOP HEADER & SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              <span>Cloudinary Asset Repository</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Game Asset Library
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Search and organize all AI visual assets across your game projects.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/generator"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 self-start md:self-auto"
            >
              <Wand2 className="w-4 h-4" />
              <span>+ Generate New Asset</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* SEARCH & FILTERS BAR */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets by prompt, tags, or name (e.g. warrior, dragon, cyberpunk)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Project Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-medium outline-none focus:border-cyan-500"
              >
                <option value="all">All Projects ({assets.length} Assets)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.gameEngine})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="md:col-span-2 flex justify-end items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* CATEGORY CHIPS */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 font-semibold mr-2">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* SORT & EXTRA FILTERS */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Sort:</span>
            {(['newest', 'oldest', 'name'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all capitalize ${
                  sortBy === s
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all ${
                  showFavoritesOnly
                    ? 'bg-pink-950/60 border-pink-500/50 text-pink-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-pink-400'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-pink-400' : ''}`} />
                <span>Favorites</span>
              </button>

              <button
                onClick={() => setCloudinaryOnly(!cloudinaryOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all ${
                  cloudinaryOnly
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-400'
                }`}
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Cloudinary Only</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* RESULTS GRID / LIST */}
        {filteredAssets.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-base font-bold text-white">No assets matched your search filters</p>
            <p className="text-xs text-slate-400">Try adjusting your query or category selection.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedProjectId('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAssets.map((asset) => (
              <motion.div key={asset.id} variants={itemVariants} whileHover={{ y: -6 }}>
                <Link
                  href={`/asset/${asset.id}`}
                  className="group bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-cyan-500/60 transition-all overflow-hidden glow-card flex flex-col h-full shadow-lg backdrop-blur-xl"
                >
                  <div className="relative aspect-square bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded bg-slate-900/90 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">
                        {asset.assetType}
                      </span>
                      {asset.isPack && (
                        <span className="px-2 py-0.5 rounded bg-purple-900/90 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                          Pack
                        </span>
                      )}
                      {asset.cloudinaryUploaded && (
                        <span className="px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          ☁ CDN
                        </span>
                      )}
                    </div>

                    {asset.isFavorite && (
                      <div className="absolute top-2.5 right-2.5">
                        <Heart className="w-4 h-4 text-pink-400 fill-pink-400 drop-shadow" />
                      </div>
                    )}

                    <div className={`absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono border ${
                      asset.cloudinaryUploaded
                        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800'
                        : 'bg-slate-950/90 text-slate-300 border-slate-800'
                    }`}>
                      {asset.cloudinaryUploaded ? 'f_auto,q_auto ✓' : 'direct'}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {asset.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 italic">
                        "{asset.prompt}"
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                      {asset.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* LIST VIEW */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-slate-900/90 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden backdrop-blur-xl shadow-xl"
          >
            {filteredAssets.map((asset) => (
              <motion.div key={asset.id} variants={itemVariants}>
                <Link
                  href={`/asset/${asset.id}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/60 transition-colors group gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-800"
                    />

                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                        {asset.name}
                      </h3>
                      <p className="text-xs text-slate-400 italic line-clamp-1">"{asset.prompt}"</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-cyan-400">{asset.assetType}</span>
                        <span className="text-[10px] text-slate-500">• {asset.projectName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-wrap gap-1">
                      {asset.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-cyan-400 border border-slate-800 text-xs font-bold group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                      Transform
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

      </main>

      <Footer />
    </div>
  );
}
