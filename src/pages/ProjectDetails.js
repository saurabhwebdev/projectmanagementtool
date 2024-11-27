import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import SprintPlanning from '../components/agile/SprintPlanning';
import BurndownChart from '../components/agile/BurndownChart';
import ProjectWiki from '../components/projects/ProjectWiki';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return <Navigate to="/projects" />;
  }

  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: ChartBarIcon,
      component: <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <BurndownChart projectId={projectId} />
      </div>
    },
    {
      id: 'sprints',
      name: 'Sprint Planning',
      icon: ClipboardDocumentListIcon,
      component: <SprintPlanning projectId={projectId} />
    },
    {
      id: 'tasks',
      name: 'Tasks',
      icon: DocumentTextIcon,
      component: <Navigate to={`/projects/${projectId}/tasks`} replace />
    },
    {
      id: 'wiki',
      name: 'Wiki',
      icon: BookOpenIcon,
      component: <ProjectWiki projectId={projectId} />
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: CogIcon,
      component: <Navigate to={`/projects/${projectId}/settings`} replace />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-500 mt-2">{project.description}</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 inline-flex items-center space-x-2
                  border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default ProjectDetails;
