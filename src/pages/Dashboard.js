import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit, getDoc, doc } from 'firebase/firestore';

const DashboardCard = ({ title, value, icon, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-dark-gray/70">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} text-white`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 0,
    tasksCompleted: 0,
    upcomingDeadlines: 0,
    totalProgress: '0%'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!currentUser?.uid) return;

        // Fetch projects based on user's membership instead of role
        const projectsQuery = query(
          collection(db, 'projects'),
          where('members', 'array-contains', {
            userId: currentUser.uid,
            role: currentUser.role === 'project_manager' ? 'owner' : 'member'
          })
        );

        // Fetch projects
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectIds = projectsSnapshot.docs.map(doc => doc.id);
        const activeProjects = projectsSnapshot.size;

        // Only proceed with activity query if we have projects
        let activities = [];
        if (projectIds.length > 0) {
          const activityQuery = query(
            collection(db, 'activity'),
            where('projectId', 'in', projectIds),
            orderBy('timestamp', 'desc'),
            limit(5)
          );
          const activitySnapshot = await getDocs(activityQuery);
          activities = activitySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));
        }
        setRecentActivity(activities);

        // Fetch tasks assigned to the user
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', '==', currentUser.uid)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dueDate: data.dueDate?.toDate ? data.dueDate : null
          };
        });
        
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        
        // Calculate upcoming deadlines
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingDeadlines = tasks.filter(task => {
          if (!task.dueDate) return false;
          return task.dueDate <= nextWeek && task.status !== 'completed';
        }).length;

        // Calculate total progress
        const totalTasks = tasks.length;
        const progressPercentage = totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100) 
          : 0;

        setStats({
          activeProjects,
          tasksCompleted: completedTasks,
          upcomingDeadlines,
          totalProgress: `${progressPercentage}%`
        });

        // Fetch team members
        if (projectIds.length > 0) {
          const memberIds = new Set();
          projectsSnapshot.docs.forEach(doc => {
            const projectData = doc.data();
            projectData.members?.forEach(member => memberIds.add(member.userId));
          });

          const teamMembersData = [];
          for (const memberId of memberIds) {
            const memberDoc = await getDoc(doc(db, 'users', memberId));
            if (memberDoc.exists()) {
              const memberData = memberDoc.data();
              teamMembersData.push({
                id: memberId,
                ...memberData,
                online: memberData.lastSeen 
                  ? new Date() - memberData.lastSeen?.toDate() < 300000 // 5 minutes
                  : false
              });
            }
          }
          setTeamMembers(teamMembersData);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    return 'just now';
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div>
      <div className="mb-8">
        <h1>Welcome back, {currentUser?.firstName || currentUser?.email}</h1>
        <p className="text-dark-gray/70">Here's what's happening with your projects.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <DashboardCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="bg-primary"
        />
        <DashboardCard
          title="Tasks Completed"
          value={stats.tasksCompleted}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="bg-success"
        />
        <DashboardCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          icon={<ClockIcon className="w-6 h-6" />}
          color="bg-error"
        />
        <DashboardCard
          title="Total Progress"
          value={stats.totalProgress}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          color="bg-primary"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center text-sm text-dark-gray/70">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'completion' ? 'bg-success' :
                    activity.type === 'update' ? 'bg-primary' :
                    'bg-error'
                  }`} />
                  <span>{activity.description}</span>
                  <span className="ml-auto">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-dark-gray/70 py-4">No recent activity</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-medium mb-4">Team Members</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                    {getInitials(member.firstName, member.lastName)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-dark-gray/70">{member.role || 'Team Member'}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 ${
                      member.online
                        ? 'bg-success/20 text-success'
                        : 'bg-light-gray text-dark-gray/50'
                    } rounded-full text-sm`}>
                      {member.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-dark-gray/70 py-4">No team members found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
