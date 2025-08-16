import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart,
  Users,
  Briefcase,
  UserCheck,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Gavel,
  FileText,
  Stethoscope,
  AlertTriangle,
  Calendar,
  Package
} from 'lucide-react';
import { Person, PersonRelationship, PersonRole } from '@/types/people';
import { getAssets } from '@/services/assetService';

interface PersonCardProps {
  person: Person;
  onEdit: (person: Person) => void;
}

const relationshipConfig: Record<PersonRelationship, { label: string; icon: React.ReactNode; color: string }> = {
  'spouse': { 
    label: 'Spouse', 
    icon: <Heart className="w-4 h-4" />,
    color: 'text-pink-600'
  },
  'child': { 
    label: 'Child', 
    icon: <Users className="w-4 h-4" />,
    color: 'text-blue-600'
  },
  'parent': { 
    label: 'Parent', 
    icon: <Users className="w-4 h-4" />,
    color: 'text-purple-600'
  },
  'sibling': { 
    label: 'Sibling', 
    icon: <Users className="w-4 h-4" />,
    color: 'text-green-600'
  },
  'grandchild': { 
    label: 'Grandchild', 
    icon: <Users className="w-4 h-4" />,
    color: 'text-cyan-600'
  },
  'friend': { 
    label: 'Friend', 
    icon: <UserCheck className="w-4 h-4" />,
    color: 'text-yellow-600'
  },
  'professional': { 
    label: 'Professional', 
    icon: <Briefcase className="w-4 h-4" />,
    color: 'text-gray-600'
  },
  'other': { 
    label: 'Other', 
    icon: <Users className="w-4 h-4" />,
    color: 'text-gray-500'
  },
};

const roleConfig: Record<PersonRole, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'guardian': { 
    label: 'Guardian', 
    icon: <Shield className="w-3 h-3" />,
    variant: 'default'
  },
  'executor': { 
    label: 'Executor', 
    icon: <Gavel className="w-3 h-3" />,
    variant: 'default'
  },
  'beneficiary': { 
    label: 'Beneficiary', 
    icon: <FileText className="w-3 h-3" />,
    variant: 'secondary'
  },
  'power-of-attorney': { 
    label: 'Power of Attorney', 
    icon: <FileText className="w-3 h-3" />,
    variant: 'default'
  },
  'healthcare-proxy': { 
    label: 'Healthcare Proxy', 
    icon: <Stethoscope className="w-3 h-3" />,
    variant: 'secondary'
  },
  'trustee': { 
    label: 'Trustee', 
    icon: <Briefcase className="w-3 h-3" />,
    variant: 'secondary'
  },
  'emergency-contact': { 
    label: 'Emergency Contact', 
    icon: <AlertTriangle className="w-3 h-3" />,
    variant: 'outline'
  },
};

export function PersonCard({ person, onEdit }: PersonCardProps) {
  const [assignedAssetsCount, setAssignedAssetsCount] = useState<number | null>(null);
  const relationship = relationshipConfig[person.relationship];

  useEffect(() => {
    const fetchAssignedAssets = async () => {
      try {
        const allAssets = await getAssets();
        const count = allAssets.filter(asset => 
          asset.assignedPeople?.includes(person.id)
        ).length;
        setAssignedAssetsCount(count);
      } catch (error) {
        console.error(`Failed to get assets for person ${person.id}`, error);
      }
    };

    fetchAssignedAssets();
  }, [person.id]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(person.dateOfBirth);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 ease-in-out group">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(person.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg">{person.fullName}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className={relationship.color}>{relationship.icon}</span>
              <span>{relationship.label}</span>
              {age && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Age {age}</span>
                </>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Roles */}
        {person.roles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {person.roles.map((role) => {
              const config = roleConfig[role];
              return (
                <Badge key={role} variant={config.variant} className="text-xs">
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </Badge>
              );
            })}
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2 text-sm">
          {person.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
          {person.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{person.phone}</span>
            </div>
          )}
          {person.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{person.address}</span>
            </div>
          )}
        </div>

        {/* Access Information */}
        {assignedAssetsCount !== null && assignedAssetsCount > 0 && (
          <div className="pt-3 mt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4 text-primary" />
              <span>Assigned to {assignedAssetsCount} asset{assignedAssetsCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Legacy Access Info - for display */}
        {person.hasAccessToAssets && person.hasAccessToAssets.length > 0 && assignedAssetsCount === 0 && (
          <div className="pt-3 mt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Has access to {person.hasAccessToAssets.length} asset{person.hasAccessToAssets.length !== 1 ? 's' : ''} (Legacy)</span>
            </div>
          </div>
        )}

        {/* Warning for missing roles */}
        {person.roles.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2">
            <p className="text-xs text-amber-900 dark:text-amber-100">
              No roles assigned yet
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 ease-in-out"
          onClick={() => onEdit(person)}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Details
        </Button>
      </CardFooter>
    </Card>
  );
}
