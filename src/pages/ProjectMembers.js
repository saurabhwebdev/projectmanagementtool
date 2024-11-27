import React from 'react';
import { useParams } from 'react-router-dom';
import ManageMembers from '../components/projects/ManageMembers';

const ProjectMembers = () => {
  const { projectId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Team Members</h1>
      <ManageMembers projectId={projectId} />
    </div>
  );
};

export default ProjectMembers; 