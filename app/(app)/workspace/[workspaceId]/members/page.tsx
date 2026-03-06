'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { useWorkspace } from '@/hooks';
import { AppShell } from '@/components/layout';
import { MemberList } from '@/components/workspace';
import { InviteMemberModal } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { workspace, members, isLoadingMembers, inviteMember, isInviting } =
    useWorkspace(workspaceId);

  const handleInvite = (data: { email: string; role: 'ADMIN' | 'MEMBER' }) => {
    inviteMember(data, {
      onSuccess: () => setShowInviteModal(false),
    });
  };

  return (
    <AppShell workspaceId={workspaceId} title={`${workspace?.name || ''} - Members`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who has access to this workspace
              </CardDescription>
            </div>
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </CardHeader>
          <CardContent>
            <MemberList members={members} isLoading={isLoadingMembers} />
          </CardContent>
        </Card>
      </div>

      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onSubmit={handleInvite}
        isLoading={isInviting}
      />
    </AppShell>
  );
}
