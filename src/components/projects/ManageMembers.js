import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { PROJECT_ROLES } from '../../utils/projectRoles';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';

const ManageMembers = ({ projectId, currentMembers, onUpdate }) => {
  const { currentUser } = useAuth();
  const { canManageMembers } = useProjectPermissions(projectId);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const memberDetails = await Promise.all(
          currentMembers.map(async (member) => {
            const userDoc = await getDoc(doc(db, 'users', member.userId));
            return {
              ...member,
              ...userDoc.data()
            };
          })
        );
        setMembers(memberDetails);
      } catch (error) {
        console.error('Error fetching member details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [currentMembers]);

  const handleRoleChange = async (memberId, newRole) => {
    if (!canManageMembers) return;

    try {
      const projectRef = doc(db, 'projects', projectId);
      
      // Remove old role
      await updateDoc(projectRef, {
        members: arrayRemove(members.find(m => m.userId === memberId))
      });

      // Add new role
      await updateDoc(projectRef, {
        members: arrayUnion({
          userId: memberId,
          role: newRole
        })
      });

      // Update local state
      setMembers(prev => prev.map(member => 
        member.userId === memberId 
          ? { ...member, role: newRole }
          : member
      ));

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Team Members</h3>
      <div className="space-y-2">
        {members.map(member => (
          <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{member.firstName} {member.lastName}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
            {canManageMembers && member.userId !== currentUser.uid && (
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                className="form-select text-sm"
              >
                {Object.entries(PROJECT_ROLES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageMembers; 