import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const ProjectWiki = ({ projectId }) => {
  const { currentUser } = useAuth();
  const [wikiPages, setWikiPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');

  useEffect(() => {
    fetchWikiPages();
  }, [projectId]);

  const fetchWikiPages = async () => {
    try {
      const wikiRef = collection(db, `projects/${projectId}/wiki`);
      const q = query(wikiRef, orderBy('createdAt', 'desc'));
      const wikiSnap = await getDocs(q);
      const pages = wikiSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWikiPages(pages);
    } catch (error) {
      console.error('Error fetching wiki pages:', error);
    }
  };

  const createWikiPage = async (e) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    try {
      const wikiRef = collection(db, `projects/${projectId}/wiki`);
      await addDoc(wikiRef, {
        title: newPageTitle,
        content: '',
        createdBy: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setNewPageTitle('');
      fetchWikiPages();
    } catch (error) {
      console.error('Error creating wiki page:', error);
    }
  };

  const updateWikiPage = async () => {
    if (!selectedPage) return;

    try {
      const pageRef = doc(db, `projects/${projectId}/wiki/${selectedPage.id}`);
      await updateDoc(pageRef, {
        content: editContent,
        updatedAt: new Date(),
        lastEditedBy: currentUser.uid
      });
      setIsEditing(false);
      fetchWikiPages();
    } catch (error) {
      console.error('Error updating wiki page:', error);
    }
  };

  const startEditing = (page) => {
    setSelectedPage(page);
    setEditContent(page.content);
    setIsEditing(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
      <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Wiki Pages</h3>
        <form onSubmit={createWikiPage} className="mb-4">
          <input
            type="text"
            placeholder="New Page Title"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            className="input-field mb-2"
          />
          <button type="submit" className="btn-primary w-full">
            Create Page
          </button>
        </form>
        <div className="space-y-2">
          {wikiPages.map(page => (
            <motion.div
              key={page.id}
              onClick={() => setSelectedPage(page)}
              className={`p-2 rounded cursor-pointer ${
                selectedPage?.id === page.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              {page.title}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 bg-white p-4 rounded-lg shadow">
        {selectedPage ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedPage.title}</h2>
              <button
                onClick={() => startEditing(selectedPage)}
                className="btn-secondary"
                hidden={isEditing}
              >
                Edit
              </button>
            </div>
            {isEditing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-64 p-2 border rounded mb-4"
                  placeholder="Write your content in Markdown..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateWikiPage}
                    className="btn-primary"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <ReactMarkdown>{selectedPage.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Select a wiki page or create a new one
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWiki;
