import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { WillStepProps, SpecificGift } from '@/types/will';
import { Person } from '@/types/people';
import { Asset } from '@/types/assets';
import { getPeople } from '@/services/peopleService';
import { getAssets } from '@/services/assetService';
import { Gift, Info, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';

export function Step4_SpecificGifts({ data, onUpdate, onNext, onBack }: WillStepProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedPeople, loadedAssets] = await Promise.all([
        getPeople(),
        getAssets()
      ]);
      setPeople(loadedPeople);
      setAssets(loadedAssets);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGift = () => {
    if (selectedAsset && selectedPerson) {
      const asset = assets.find(a => a.id === selectedAsset);
      const person = people.find(p => p.id === selectedPerson);
      
      if (asset && person) {
        const newGift: SpecificGift = {
          id: `gift-${Date.now()}`,
          assetId: asset.id,
          assetName: asset.name,
          beneficiaryId: person.id,
          beneficiaryName: person.fullName
        };
        
        onUpdate({
          specificGifts: [...data.specificGifts, newGift]
        });
        
        setSelectedAsset('');
        setSelectedPerson('');
      }
    }
  };

  const handleRemoveGift = (giftId: string) => {
    onUpdate({
      specificGifts: data.specificGifts.filter(g => g.id !== giftId)
    });
  };

  const availableAssets = assets.filter(
    asset => !data.specificGifts.some(gift => gift.assetId === asset.id)
  );

  const handleNext = () => {
    const newCompletedSteps = new Set(data.completedSteps);
    newCompletedSteps.add(4);
    onUpdate({ completedSteps: newCompletedSteps });
    onNext();
  };

  if (loading) {
    return <div className="text-center py-8">Loading your assets and people...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Distribute Specific Gifts</h2>
        <p className="text-muted-foreground">
          Assign specific assets to particular beneficiaries. Any assets not assigned here 
          will be part of your residual estate.
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          Specific gifts are given first, before the residual estate is distributed. 
          This step is optional - you can distribute everything through the residual estate instead.
        </AlertDescription>
      </Alert>

      {/* Add Gift Form */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Asset</label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an asset" />
              </SelectTrigger>
              <SelectContent>
                {availableAssets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name} ({asset.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Select Beneficiary</label>
            <Select value={selectedPerson} onValueChange={setSelectedPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a beneficiary" />
              </SelectTrigger>
              <SelectContent>
                {people.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.fullName} ({person.relationship})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          onClick={handleAddGift}
          disabled={!selectedAsset || !selectedPerson}
          className="mt-4 w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Specific Gift
        </Button>
      </Card>

      {/* Gifts List */}
      {data.specificGifts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Your Specific Gifts
          </h3>
          {data.specificGifts.map(gift => (
            <Card key={gift.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{gift.assetName}</p>
                  <p className="text-sm text-muted-foreground">
                    To: {gift.beneficiaryName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveGift(gift.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNext} size="lg" className="gap-2">
          Next Step
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
