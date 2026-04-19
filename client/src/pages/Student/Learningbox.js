import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from "../../context/auth";

const Learningbox = () => {
  const [auth] = useAuth();
  const [items, setItems] = useState([]);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('M');
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const menuButtonRefs = useRef({});
  const stylePanelRef = useRef(null);

  const colors = [
    '#000000', '#6B7280', '#C084FC', '#8B5CF6',
    '#3B82F6', '#06B6D4', '#F59E0B', '#F97316',
    '#10B981', '#22C55E', '#FB7185', '#EF4444'
  ];

  const fontSizes = {
    'S': '14px',
    'M': '16px',
    'L': '18px',
    'XL': '20px'
  };

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch(
          `https://hostelwers.onrender.com/api/v1/learning/all-notes`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        const data = await response.json();
        if (data.success && data.notes.length > 0) {
          setItems(data.notes);
          const latestItem = data.notes[0];
          setCurrentItemId(latestItem._id);
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = latestItem.content || '';
            }
          }, 0);
        } else {
          createNewItem();
        }
      } catch (error) {
        console.error('Failed to load items:', error);
        createNewItem();
      }
    };
    if (auth?.token) loadItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-button') && !event.target.closest('.dropdown-menu-portal')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showStylePanel) return;
    const handleOutside = (e) => {
      if (stylePanelRef.current && !stylePanelRef.current.contains(e.target)) {
        setShowStylePanel(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [showStylePanel]);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!showSidebar) return;
    const handleOutside = (e) => {
      if (!e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle-btn')) {
        setShowSidebar(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('click', handleOutside), 50);
    return () => { clearTimeout(timer); document.removeEventListener('click', handleOutside); };
  }, [showSidebar]);

  const createNewItem = async () => {
    try {
      const response = await fetch(`https://hostelwers.onrender.com/api/v1/learning/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ content: '' }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedItems = [data.note, ...items];
        setItems(updatedItems);
        setCurrentItemId(data.note._id);
        setTimeout(() => {
          if (editorRef.current) { editorRef.current.innerHTML = ''; editorRef.current.focus(); }
        }, 100);
      }
    } catch (error) { console.error('Failed to create item:', error); }
  };

  const saveItems = async (itemId, content, linkPreviews = {}) => {
    try {
      const response = await fetch(`https://hostelwers.onrender.com/api/v1/learning/notes/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ content, linkPreviews }),
      });
      const data = await response.json();
      if (data.success) {
        setItems(prevItems => prevItems.map(item => item._id === itemId ? data.note : item));
      }
    } catch (error) { console.error('Failed to save item:', error); }
  };

  const extractVideoId = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (watchMatch) return { type: 'youtube', id: watchMatch[1] };
      const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (shortMatch) return { type: 'youtube', id: shortMatch[1] };
      const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
      if (embedMatch) return { type: 'youtube', id: embedMatch[1] };
      const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch) return { type: 'youtube', id: shortsMatch[1] };
    }
    const instagramMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
    if (instagramMatch) return { type: 'instagram', id: instagramMatch[1] };
    const twitterMatch = url.match(/(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/);
    if (twitterMatch) return { type: 'twitter', id: twitterMatch[1] };
    const facebookMatch = url.match(/facebook\.com\/[^/]+\/videos\/(\d+)/);
    if (facebookMatch) return { type: 'facebook', id: facebookMatch[1] };
    const fbWatchMatch = url.match(/fb\.watch\/([a-zA-Z0-9_-]+)/);
    if (fbWatchMatch) return { type: 'facebook', id: fbWatchMatch[1] };
    const tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (tiktokMatch) return { type: 'tiktok', id: tiktokMatch[1] };
    const tiktokShortMatch = url.match(/(?:vm\.)?tiktok\.com\/([a-zA-Z0-9]+)/);
    if (tiktokShortMatch) return { type: 'tiktok', id: tiktokShortMatch[1] };
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };
    return null;
  };

  const detectLinks = (text) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const urlPatterns = {
      youtube: [/https?:\/\/(?:www\.)?youtube\.com\/watch\?[^\s<>"]+/gi, /https?:\/\/(?:www\.)?youtu\.be\/[^\s<>"]+/gi, /https?:\/\/(?:www\.)?youtube\.com\/embed\/[^\s<>"]+/gi, /https?:\/\/(?:www\.)?m\.youtube\.com\/watch\?[^\s<>"]+/gi, /https?:\/\/(?:www\.)?youtube\.com\/shorts\/[^\s<>"]+/gi],
      instagram: [/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[^\s<>"]+/gi, /https?:\/\/(?:www\.)?instagr\.am\/(?:p|reel)\/[^\s<>"]+/gi],
      twitter: [/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^/]+\/status\/[^\s<>"]+/gi],
      facebook: [/https?:\/\/(?:www\.)?facebook\.com\/[^/]+\/videos\/[^\s<>"]+/gi, /https?:\/\/(?:www\.)?fb\.watch\/[^\s<>"]+/gi],
      tiktok: [/https?:\/\/(?:www\.)?tiktok\.com\/@[^/]+\/video\/[^\s<>"]+/gi, /https?:\/\/(?:vm\.)?tiktok\.com\/[^\s<>"]+/gi],
      vimeo: [/https?:\/\/(?:www\.)?vimeo\.com\/[^\s<>"]+/gi]
    };
    const links = new Set();
    Object.values(urlPatterns).forEach(patterns => {
      patterns.forEach(pattern => {
        const matches = [...plainText.matchAll(pattern)];
        matches.forEach(match => { let url = match[0].trim().replace(/[,;.!?]+$/, ''); links.add(url); });
      });
    });
    return Array.from(links);
  };

  const processLinks = async (content) => {
    const links = detectLinks(content);
    const newPreviews = {};
    for (const link of links) {
      const videoInfo = extractVideoId(link);
      if (videoInfo) {
        const { type, id } = videoInfo;
        const previewKey = link;
        switch (type) {
          case 'youtube':
            try {
              const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(link)}&format=json`;
              const response = await fetch(oembedUrl);
              const data = await response.json();
              newPreviews[previewKey] = { type: 'youtube', videoId: id, thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, url: link, platform: 'YouTube', title: data.title || `YouTube Video (${id})`, author: data.author_name || 'YouTube', description: '' };
            } catch (error) {
              newPreviews[previewKey] = { type: 'youtube', videoId: id, thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, url: link, platform: 'YouTube', title: `YouTube Video (${id})`, author: 'YouTube', description: '' };
            }
            break;
          case 'instagram': newPreviews[previewKey] = { type: 'instagram', postId: id, thumbnail: `https://www.instagram.com/p/${id}/media/?size=l`, url: link, platform: 'Instagram', embedUrl: `https://www.instagram.com/p/${id}/embed` }; break;
          case 'twitter': newPreviews[previewKey] = { type: 'twitter', tweetId: id, url: link, platform: 'Twitter/X' }; break;
          case 'facebook': newPreviews[previewKey] = { type: 'facebook', videoId: id, url: link, platform: 'Facebook' }; break;
          case 'tiktok': newPreviews[previewKey] = { type: 'tiktok', videoId: id, url: link, platform: 'TikTok' }; break;
          case 'vimeo': newPreviews[previewKey] = { type: 'vimeo', videoId: id, thumbnail: `https://vumbnail.com/${id}.jpg`, url: link, platform: 'Vimeo' }; break;
          default: break;
        }
      }
    }
    return newPreviews;
  };

  const autoSave = (content) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!currentItemId) return;
      const previews = await processLinks(content);
      await saveItems(currentItemId, content, previews);
    }, 500);
  };

  const autoSaveWithPreviews = (itemId, content, previews) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!itemId) return;
      await saveItems(itemId, content, previews);
    }, 500);
  };

  const handleEditorChange = (content) => {
    const existingPreviews = currentItem?.linkPreviews || {};
    const hasUrls = /https?:\/\/[^\s]+/gi.test(content);
    if (hasUrls) {
      processLinks(content).then(newPreviews => {
        if (Object.keys(newPreviews).length > 0) {
          const allPreviews = { ...existingPreviews, ...newPreviews };
          let cleanContent = content;
          Object.keys(allPreviews).forEach(url => {
            const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            cleanContent = cleanContent.replace(new RegExp(escapedUrl, 'gi'), '');
          });
          cleanContent = cleanContent.replace(/\s+/g, ' ').replace(/(<br\s*\/?>[\s]*){2,}/gi, '<br>').trim();
          if (editorRef.current) {
            editorRef.current.innerHTML = cleanContent;
            setTimeout(() => {
              if (editorRef.current) {
                editorRef.current.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                if (editorRef.current.childNodes.length > 0) {
                  const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
                  if (lastNode.nodeType === Node.TEXT_NODE) { range.setStart(lastNode, lastNode.length); }
                  else if (lastNode.lastChild) { range.setStartAfter(lastNode.lastChild); }
                  else { range.setStartAfter(lastNode); }
                  range.collapse(true); sel.removeAllRanges(); sel.addRange(range);
                }
              }
            }, 10);
          }
          if (currentItemId) {
            setItems(prevItems => prevItems.map(item => item._id === currentItemId ? { ...item, linkPreviews: allPreviews, content: cleanContent } : item));
          }
          autoSaveWithPreviews(currentItemId, cleanContent, allPreviews);
        }
      });
    } else {
      if (currentItemId && Object.keys(existingPreviews).length > 0) {
        setItems(prevItems => prevItems.map(item => item._id === currentItemId ? { ...item, linkPreviews: existingPreviews, content: content } : item));
        autoSaveWithPreviews(currentItemId, content, existingPreviews);
      } else {
        autoSave(content);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      if (items.length === 1) await createNewItem();
      const response = await fetch(`https://hostelwers.onrender.com/api/v1/learning/notes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } });
      const data = await response.json();
      if (data.success) {
        const updatedItems = items.filter(item => item._id !== id);
        setItems(updatedItems);
        if (id === currentItemId && updatedItems.length > 0) {
          const nextItem = updatedItems[0];
          setCurrentItemId(nextItem._id);
          if (editorRef.current) editorRef.current.innerHTML = nextItem.content || '';
        }
      }
    } catch (error) { console.error('Failed to delete item:', error); }
    setOpenMenuId(null);
  };

  const handleMakePrivate = async (id) => {
    const item = items.find(i => i._id === id);
    try {
      const response = await fetch(`https://hostelwers.onrender.com/api/v1/learning/notes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ isPrivate: !item.isPrivate }) });
      const data = await response.json();
      if (data.success) setItems(items.map(i => i._id === id ? data.note : i));
    } catch (error) { console.error('Failed to update privacy:', error); }
    setOpenMenuId(null);
  };

  const handleArchive = async (id) => {
    const item = items.find(i => i._id === id);
    try {
      const response = await fetch(`https://hostelwers.onrender.com/api/v1/learning/notes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ isArchived: !item.isArchived }) });
      const data = await response.json();
      if (data.success) setItems(items.map(i => i._id === id ? data.note : i));
    } catch (error) { console.error('Failed to archive:', error); }
    setOpenMenuId(null);
  };

  const handleFullWidth = async (id) => {
    const item = items.find(i => i._id === id);
    try {
      const response = await fetch(`https://hostelwers.onrender.com/api/v1/learning/notes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ isFullWidth: !item.isFullWidth }) });
      const data = await response.json();
      if (data.success) setItems(items.map(i => i._id === id ? data.note : i));
    } catch (error) { console.error('Failed to update width:', error); }
    setOpenMenuId(null);
  };

  const handleItemClick = (item) => {
    setCurrentItemId(item._id);
    setShowSidebar(false); // close sidebar on mobile after selecting a note
    if (editorRef.current) {
      editorRef.current.innerHTML = item.content || '';
      setTimeout(() => {
        editorRef.current.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        if (editorRef.current.childNodes.length > 0) {
          const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
          range.setStartAfter(lastNode); range.collapse(true); sel.removeAllRanges(); sel.addRange(range);
        }
      }, 0);
    }
    if (item.content) {
      processLinks(item.content).then(previews => {
        if (Object.keys(previews).length > 0) {
          setItems(items.map(i => i._id === item._id ? { ...i, linkPreviews: previews } : i));
        }
      });
    }
  };

  const handleDeletePreview = (e, url) => {
    e.preventDefault(); e.stopPropagation();
    if (!currentItemId || !currentItem) return;
    const updatedPreviews = { ...currentItem.linkPreviews };
    delete updatedPreviews[url];
    setItems(prevItems => prevItems.map(item => item._id === currentItemId ? { ...item, linkPreviews: updatedPreviews } : item));
    autoSaveWithPreviews(currentItemId, currentItem.content, updatedPreviews);
  };

  const toggleMenu = (e, itemId) => {
    e.stopPropagation();
    if (openMenuId === itemId) { setOpenMenuId(null); return; }
    const button = menuButtonRefs.current[itemId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 5, left: rect.left - 150 });
    }
    setOpenMenuId(itemId);
  };

  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    applyFormatting('foreColor', color);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = fontSizes[size];
      try { range.surroundContents(span); }
      catch (e) { const fragment = range.extractContents(); span.appendChild(fragment); range.insertNode(span); }
    }
    editorRef.current?.focus();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    if (dateOnly.getTime() === todayOnly.getTime()) return 'Today';
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const currentItem = items.find(item => item._id === currentItemId);

  return (
    <>
    <style>{`
* { box-sizing: border-box; margin: 0; padding: 0; }

.content-manager {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
}

.manager-container {
  width: 100%;
  margin: 0;
  display: flex;
  height: 100vh;
}

/* ── SIDEBAR ──────────────────────────────── */
.sidebar {
  width: 256px;
  min-width: 256px;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  background-color: white;
  flex-shrink: 0;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.sidebar-content { padding: 16px; }

.sidebar-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 16px;
}

.notes-list { display: flex; flex-direction: column; gap: 8px; }

.note-card {
  position: relative;
  padding: 12px;
  padding-right: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.note-card:hover { background-color: #f9fafb; }
.note-card.active { background-color: #eff6ff; border-color: #bfdbfe; }

.note-preview {
  font-size: 0.875rem;
  color: #374151;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}
.empty-note { color: #9ca3af; font-style: italic; }

.note-footer { display: flex; align-items: center; justify-content: space-between; }
.note-date { font-size: 0.75rem; color: #9ca3af; }
.privacy-icon { width: 12px; height: 12px; color: #9ca3af; }

.menu-button {
  position: absolute; top: 10px; right: 10px;
  width: 28px; height: 28px; padding: 6px;
  background: white; border: 1px solid #d1d5db;
  cursor: pointer; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; transition: all 0.2s;
}
.menu-button:hover { background-color: #f3f4f6; border-color: #9ca3af; transform: scale(1.05); }
.menu-button:active { background-color: #e5e7eb; }
.menu-icon { width: 16px; height: 16px; color: #374151; }

.dropdown-menu-portal {
  position: fixed; z-index: 999999;
  background-color: white; border-radius: 10px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2);
  border: 1px solid #d1d5db; padding: 8px; min-width: 200px;
}

.menu-item {
  width: 100%; padding: 10px 12px; text-align: left;
  font-size: 0.875rem; color: #374151;
  background: none; border: none; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  border-radius: 6px; font-weight: 500; white-space: nowrap;
  transition: background-color 0.15s;
}
.menu-item:hover { background-color: #f3f4f6; }
.menu-item.delete { color: #dc2626; border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 12px; }
.menu-item.delete:hover { background-color: #fee2e2; }
.menu-item-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* ── MAIN EDITOR ──────────────────────────── */
.main-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 0; /* prevents flex overflow */
  min-width: 0;
}

.top-bar { border-bottom: 1px solid #e5e7eb; padding: 16px 24px; }
.top-bar-content { display: flex; align-items: center; gap: 12px; }

.delete-button {
  padding: 8px; color: #9ca3af;
  background: none; border: none; cursor: pointer;
  border-radius: 8px; transition: all 0.2s;
}
.delete-button:hover { color: #ef4444; background-color: #fef2f2; }
.delete-button:active { background-color: #fee2e2; color: #dc2626; }
.delete-icon { width: 20px; height: 20px; }
.current-date { font-size: 0.875rem; color: #6b7280; }

/* Mobile sidebar toggle button in top bar */
.sidebar-toggle-btn {
  display: none;
  padding: 8px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-right: 4px;
}
.sidebar-toggle-btn:hover { background-color: #f3f4f6; color: #111827; }
.sidebar-toggle-icon { width: 20px; height: 20px; }

.editor-wrapper { flex: 1; display: flex; overflow: hidden; width: 100%; }

.editor-container {
  flex: 1; padding: 24px; padding-bottom: 100px;
  overflow-y: auto; width: 100%; max-width: 100%;
}

.editor-content-wrapper { display: flex; flex-direction: column; min-height: auto; }

.link-previews {
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  pointer-events: auto;
}

.editor {
  min-height: 100px; outline: none; color: #1f2937;
  width: 100%; padding: 8px 0; direction: ltr; unicode-bidi: normal;
}
.editor:empty:before { content: attr(data-placeholder); color: #9ca3af; font-style: italic; pointer-events: none; }
.editor:focus:before { content: ''; }

.youtube-preview, .social-preview {
  display: block; background-color: white;
  border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
  text-decoration: none; transition: all 0.2s; max-width: 100%;
  cursor: pointer; position: relative;
}
.youtube-preview:hover, .social-preview:hover {
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.preview-delete-btn {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px;
  background-color: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; opacity: 0; transition: all 0.2s; z-index: 10;
}
.youtube-preview:hover .preview-delete-btn, .social-preview:hover .preview-delete-btn { opacity: 1; }
.preview-delete-btn:hover { background-color: rgba(239,68,68,0.9); transform: scale(1.1); }
.preview-delete-icon { width: 16px; height: 16px; color: white; }

.youtube-thumbnail, .social-thumbnail {
  position: relative; aspect-ratio: 16/9; background-color: #111827;
}
.thumbnail-image { width: 100%; height: 100%; object-fit: cover; }
.play-button-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.play-button { width: 64px; height: 64px; background-color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0.9; transition: opacity 0.2s; }
.play-button:hover { opacity: 1; }
.play-button.vimeo-play { background-color: #1ab7ea; }
.play-icon { width: 32px; height: 32px; color: white; margin-left: 4px; }
.instagram-icon-wrapper, .twitter-icon-wrapper, .facebook-icon-wrapper, .tiktok-icon-wrapper { width: 64px; height: 64px; background-color: rgba(255,255,255,0.95); border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0.9; transition: opacity 0.2s; }
.platform-icon { width: 32px; height: 32px; }
.platform-icon-large { width: 48px; height: 48px; }
.youtube-info, .social-info { padding: 12px; }
.social-info-only { padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
.youtube-title, .social-title { font-weight: 600; font-size: 0.875rem; color: #111827; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; }
.youtube-description { font-size: 0.75rem; color: #6b7280; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
.youtube-source, .social-source { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #9ca3af; }
.youtube-icon { width: 16px; height: 16px; color: #dc2626; }

/* ── STYLE PANEL ────────────────────────────── */
.style-panel-wrapper {
  position: relative;
  z-index: 20;
}

.style-panel {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: white;
  border: 1px solid #e2e8f0;
  border-right: none;
  border-radius: 20px 0 0 20px;
  box-shadow: -6px 0 32px rgba(0,0,0,0.10);
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
  z-index: 200;
}

.style-panel:not(.visible) { width: 44px; }
.style-panel.visible       { width: 268px; }

.style-panel-toggle {
  width: 44px;
  min-width: 44px;
  background: transparent;
  border: none;
  border-right: 1px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px 0;
  transition: background 0.2s;
}
.style-panel-toggle:hover { background: #f8fafc; }

.toggle-icon-svg {
  width: 20px;
  height: 20px;
  color: #94a3b8;
  flex-shrink: 0;
}

.toggle-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  white-space: nowrap;
  user-select: none;
}

.style-panel-content {
  width: 224px;
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s;
  overflow-y: auto;
}
.style-panel.visible .style-panel-content {
  opacity: 1;
  pointer-events: auto;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.color-button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  outline: none;
}
.color-button:hover { transform: scale(1.12); box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
.color-button.selected { border-color: #1e293b; transform: scale(1.18); box-shadow: 0 3px 10px rgba(0,0,0,0.22); }

.panel-divider { height: 1px; background: #f1f5f9; margin: 0 -18px; }

.size-row { display: flex; gap: 6px; }
.size-button {
  flex: 1;
  height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 13px;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.15s;
  background: #f8fafc;
  color: #64748b;
}
.size-button:hover { background: #f1f5f9; border-color: #cbd5e1; color: #374151; }
.size-button.selected { background: #1e293b; color: white; border-color: #1e293b; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }

.format-row { display: flex; gap: 6px; }
.format-button {
  flex: 1; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; background: #f8fafc; color: #374151;
  border: 1.5px solid #e5e7eb; cursor: pointer;
  transition: all 0.15s; font-weight: 600;
}
.format-button:hover { background: #f1f5f9; border-color: #cbd5e1; transform: translateY(-1px); }
.format-button:active { transform: translateY(0); }
.format-button.bold { font-weight: 800; }
.format-button.italic { font-style: italic; }
.format-button.underline { text-decoration: underline; }
.format-button.strikethrough { text-decoration: line-through; }

.align-row { display: flex; gap: 6px; }
.align-button {
  flex: 1; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: #f8fafc; border: 1.5px solid #e5e7eb;
  cursor: pointer; transition: all 0.15s;
}
.align-button:hover { background: #f1f5f9; border-color: #cbd5e1; transform: translateY(-1px); }
.align-button:active { transform: translateY(0); }
.align-icon { width: 16px; height: 16px; color: #475569; }

/* ── BOTTOM NAV ──────────────────────────── */
.bottom-nav {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background-color: white; border: 1px solid #e5e7eb;
  border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  z-index: 50; padding: 8px;
}
.bottom-nav-content { display: flex; align-items: center; gap: 8px; }
.nav-button {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  color: #6b7280; background: none; border: none; cursor: pointer;
  transition: all 0.2s; padding: 8px 16px; border-radius: 8px; min-width: 70px;
}
.nav-button:hover { background-color: #f3f4f6; color: #111827; }
.nav-icon-wrapper { width: auto; height: auto; display: flex; align-items: center; justify-content: center; }
.nav-icon { width: 20px; height: 20px; }
.nav-label { font-size: 0.75rem; font-weight: 500; }
.add-button {
  color: white; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  border-radius: 50%; padding: 0; min-width: auto; width: 48px; height: 48px; margin-left: 8px;
}
.add-button:hover { background: linear-gradient(135deg, #db2777 0%, #be185d 100%); transform: scale(1.05); }
.add-icon-wrapper { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.add-icon { width: 24px; height: 24px; }

/* ── MOBILE OVERLAY (sidebar backdrop) ─────── */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 99;
}

/* ════════════════════════════════════════════
   TABLET  (641px – 1023px)
════════════════════════════════════════════ */
@media (min-width: 641px) and (max-width: 1023px) {
  .sidebar {
    width: 220px;
    min-width: 220px;
  }

  .top-bar { padding: 12px 16px; }

  .editor-container { padding: 16px; padding-bottom: 100px; }

  .link-previews {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  /* Style panel slightly narrower on tablet */
  .style-panel.visible { width: 248px; }
  .style-panel-content { width: 204px; padding: 16px 14px; }

  .bottom-nav { bottom: 16px; }
  .nav-button { padding: 8px 12px; min-width: 60px; }
}

/* ════════════════════════════════════════════
   MOBILE  (≤ 640px)
════════════════════════════════════════════ */
@media (max-width: 640px) {

  /* Show hamburger button */
  .sidebar-toggle-btn { display: flex; }

  /* Sidebar slides in as a drawer over content */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 280px;
    min-width: 280px;
    z-index: 100;
    box-shadow: 4px 0 24px rgba(0,0,0,0.15);
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }

  /* Backdrop overlay shown when sidebar is open */
  .sidebar-overlay.open { display: block; }

  /* Main editor fills full width */
  .main-editor { width: 100%; }

  /* Top bar tighter on mobile */
  .top-bar { padding: 10px 12px; }
  .top-bar-content { gap: 8px; }
  .current-date { font-size: 0.75rem; }

  /* Editor padding reduced */
  .editor-container { padding: 12px 12px 100px 12px; }

  /* Link preview cards stack full width on very small screens */
  .link-previews {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* Style panel: smaller, positioned to not cover content */
  .style-panel:not(.visible) { width: 38px; }
  .style-panel.visible { width: 240px; }
  .style-panel-toggle { width: 38px; min-width: 38px; padding: 16px 0; gap: 8px; }
  .toggle-icon-svg { width: 17px; height: 17px; }
  .toggle-text { font-size: 10px; letter-spacing: 0.6px; }
  .style-panel-content { width: 202px; padding: 14px 12px; gap: 12px; }
  .color-button { width: 30px; height: 30px; }
  .color-grid { gap: 8px; }
  .size-button { height: 34px; font-size: 12px; }
  .format-button { height: 34px; font-size: 14px; }
  .align-button { height: 34px; }

  /* Bottom nav: tighter, full-width feel */
  .bottom-nav {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px;
    border-radius: 14px;
    width: calc(100% - 24px);
    max-width: 400px;
  }
  .bottom-nav-content { gap: 4px; justify-content: space-between; }
  .nav-button {
    padding: 6px 8px;
    min-width: auto;
    flex: 1;
    gap: 3px;
  }
  .nav-icon { width: 18px; height: 18px; }
  .nav-label { font-size: 0.65rem; }
  .add-button {
    width: 44px; height: 44px;
    flex: 0 0 44px;
    margin-left: 4px;
  }
  .add-icon { width: 22px; height: 22px; }

  /* Dropdown menu: wider touch targets */
  .menu-item { padding: 12px 14px; font-size: 0.9rem; }
}

/* ════════════════════════════════════════════
   VERY SMALL MOBILE  (≤ 380px)
════════════════════════════════════════════ */
@media (max-width: 380px) {
  .sidebar { width: 260px; min-width: 260px; }

  .style-panel.visible { width: 220px; }
  .style-panel-content { width: 182px; padding: 12px 10px; }
  .color-button { width: 26px; height: 26px; }
  .color-grid { gap: 6px; }

  .nav-label { display: none; }
  .nav-button { padding: 8px 6px; gap: 0; }

  .editor-container { padding: 10px 10px 90px 10px; }
}
    `}</style>

    <div className="content-manager">
      <div className="manager-container">

        {/* MOBILE OVERLAY */}
        <div
          className={`sidebar-overlay ${showSidebar ? 'open' : ''}`}
          onClick={() => setShowSidebar(false)}
        />

        {/* SIDEBAR */}
        <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
          <div className="sidebar-content">
            <h2 className="sidebar-title">ALL NOTES</h2>
            <div className="notes-list">
              {items.map((item) => (
                <div key={item._id} className={`note-card ${currentItemId === item._id ? 'active' : ''}`}>
                  <div onClick={() => handleItemClick(item)}>
                    <div className="note-preview" dangerouslySetInnerHTML={{ __html: item.content || '<span class="empty-note">Empty note</span>' }} />
                    <div className="note-footer">
                      <div className="note-date">{formatDate(item.updatedAt)}</div>
                      {item.isPrivate && (
                        <svg className="privacy-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <button ref={el => menuButtonRefs.current[item._id] = el} onClick={(e) => toggleMenu(e, item._id)} className="menu-button">
                    <svg className="menu-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN EDITOR */}
        <div className="main-editor">
          <div className="top-bar">
            <div className="top-bar-content">
              {/* Hamburger — visible only on mobile via CSS */}
              <button
                className="sidebar-toggle-btn"
                onClick={() => setShowSidebar(v => !v)}
                title="Toggle notes list"
              >
                <svg className="sidebar-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <button onClick={() => handleDeleteItem(currentItemId)} className="delete-button" title="Delete this note">
                <Trash2 className="delete-icon" />
              </button>
              <div className="current-date">{currentItem && formatDate(currentItem.updatedAt)}</div>
            </div>
          </div>

          <div className="editor-wrapper">
            <div className="editor-container">
              <div className="editor-content-wrapper">
                {currentItem && currentItem.linkPreviews && Object.keys(currentItem.linkPreviews).length > 0 && (
                  <div className="link-previews" contentEditable={false}>
                    {Object.entries(currentItem.linkPreviews).map(([url, preview]) => {
                      if (preview.type === 'youtube') return (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="youtube-preview">
                          <button className="preview-delete-btn" onClick={(e) => handleDeletePreview(e, url)} title="Delete this preview">
                            <svg className="preview-delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <div className="youtube-thumbnail">
                            <img src={preview.thumbnail} alt="Video thumbnail" className="thumbnail-image" onError={(e) => { e.target.src = `https://img.youtube.com/vi/${preview.videoId}/hqdefault.jpg`; }} />
                            <div className="play-button-overlay"><div className="play-button"><svg className="play-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg></div></div>
                          </div>
                          <div className="youtube-info">
                            <h3 className="youtube-title">{preview.title || `YouTube Video (${preview.videoId})`}</h3>
                            {preview.author && <div className="youtube-description">{preview.author}</div>}
                            <div className="youtube-source">
                              <svg className="youtube-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                              <span>YouTube</span>
                            </div>
                          </div>
                        </a>
                      );
                      if (preview.type === 'instagram') return (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="social-preview instagram-preview">
                          <div className="social-thumbnail">
                            <img src={preview.thumbnail} alt="Instagram post" className="thumbnail-image" onError={(e) => { e.target.style.display = 'none'; }} />
                            <div className="play-button-overlay"><div className="instagram-icon-wrapper"><svg className="platform-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></div></div>
                          </div>
                          <div className="social-info"><h3 className="social-title">{preview.platform} Post</h3><div className="social-source"><span>www.instagram.com</span></div></div>
                        </a>
                      );
                      if (preview.type === 'twitter') return (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="social-preview twitter-preview">
                          <div className="social-info-only">
                            <div className="twitter-icon-wrapper"><svg className="platform-icon-large" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>
                            <h3 className="social-title">{preview.platform} Post</h3>
                            <div className="social-source"><span>View on {preview.platform}</span></div>
                          </div>
                        </a>
                      );
                      if (preview.type === 'facebook') return (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="social-preview facebook-preview">
                          <div className="social-info-only">
                            <div className="facebook-icon-wrapper"><svg className="platform-icon-large" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                            <h3 className="social-title">{preview.platform} Video</h3>
                            <div className="social-source"><span>www.facebook.com</span></div>
                          </div>
                        </a>
                      );
                      if (preview.type === 'tiktok') return (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="social-preview tiktok-preview">
                          <div className="social-info-only">
                            <div className="tiktok-icon-wrapper"><svg className="platform-icon-large" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></div>
                            <h3 className="social-title">{preview.platform} Video</h3>
                            <div className="social-source"><span>www.tiktok.com</span></div>
                          </div>
                        </a>
                      );
                      if (preview.type === 'vimeo') return (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="social-preview vimeo-preview">
                          <div className="social-thumbnail">
                            <img src={preview.thumbnail} alt="Vimeo video" className="thumbnail-image" onError={(e) => { e.target.style.display = 'none'; }} />
                            <div className="play-button-overlay"><div className="play-button vimeo-play"><svg className="play-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg></div></div>
                          </div>
                          <div className="social-info"><h3 className="social-title">{preview.platform} Video</h3><div className="social-source"><span>vimeo.com</span></div></div>
                        </a>
                      );
                      return null;
                    })}
                  </div>
                )}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={(e) => handleEditorChange(e.currentTarget.innerHTML)}
                  className="editor"
                  style={{ fontSize: fontSizes[fontSize] }}
                  data-placeholder="Do whatever you want..."
                />
              </div>
            </div>

            {/* ── STYLE PANEL ── */}
            <div className="style-panel-wrapper">
              <div ref={stylePanelRef} className={`style-panel ${showStylePanel ? 'visible' : ''}`}>
                <button onClick={() => setShowStylePanel(v => !v)} className="style-panel-toggle">
                  <svg className="toggle-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="toggle-text">Style Panel</span>
                </button>

                <div className="style-panel-content">
                  <div className="color-grid">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`color-button ${selectedColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="panel-divider" />

                  <div className="size-row">
                    {Object.keys(fontSizes).map((size) => (
                      <button
                        key={size}
                        onClick={() => handleFontSizeChange(size)}
                        className={`size-button ${fontSize === size ? 'selected' : ''}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <div className="panel-divider" />

                  <div className="format-row">
                    <button onClick={() => applyFormatting('bold')} className="format-button bold">B</button>
                    <button onClick={() => applyFormatting('italic')} className="format-button italic">I</button>
                    <button onClick={() => applyFormatting('underline')} className="format-button underline">U</button>
                    <button onClick={() => applyFormatting('strikeThrough')} className="format-button strikethrough">S</button>
                  </div>

                  <div className="panel-divider" />

                  <div className="align-row">
                    <button onClick={() => applyFormatting('justifyLeft')} className="align-button">
                      <svg className="align-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4h16v2H2V4zm0 5h10v2H2V9zm0 5h16v2H2v-2z"/></svg>
                    </button>
                    <button onClick={() => applyFormatting('justifyCenter')} className="align-button">
                      <svg className="align-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4h16v2H2V4zm3 5h10v2H5V9zm-3 5h16v2H2v-2z"/></svg>
                    </button>
                    <button onClick={() => applyFormatting('justifyRight')} className="align-button">
                      <svg className="align-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4h16v2H2V4zm6 5h10v2H8V9zm-6 5h16v2H2v-2z"/></svg>
                    </button>
                    <button onClick={() => applyFormatting('justifyFull')} className="align-button">
                      <svg className="align-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4h16v2H2V4zm0 5h16v2H2V9zm0 5h16v2H2v-2z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <div className="bottom-nav-content">
          <button className="nav-button">
            <div className="nav-icon-wrapper"><svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <span className="nav-label">Select</span>
          </button>
          <button className="nav-button">
            <div className="nav-icon-wrapper"><svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
            <span className="nav-label">Read</span>
          </button>
          <button className="nav-button">
            <div className="nav-icon-wrapper"><svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg></div>
            <span className="nav-label">Archive</span>
          </button>
          <button onClick={async () => { await createNewItem(); if (editorRef.current) editorRef.current.focus(); }} className="nav-button add-button">
            <div className="add-icon-wrapper"><svg className="add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU PORTAL */}
      {openMenuId && (
        <div className="dropdown-menu-portal" style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}>
          <button onClick={() => handleMakePrivate(openMenuId)} className="menu-item">
            <svg className="menu-item-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            {items.find(i => i._id === openMenuId)?.isPrivate ? 'Make public' : 'Make private'}
          </button>
          <button onClick={() => handleFullWidth(openMenuId)} className="menu-item">
            <svg className="menu-item-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>
            Full width
          </button>
          <button onClick={() => handleArchive(openMenuId)} className="menu-item">
            <svg className="menu-item-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
            Archive
          </button>
          <button onClick={() => handleDeleteItem(openMenuId)} className="menu-item delete">
            <svg className="menu-item-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            Delete
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default Learningbox;