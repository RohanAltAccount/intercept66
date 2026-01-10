import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Info, Rocket } from 'lucide-react';
import { toast } from 'sonner';

interface AddSatelliteFormProps {
  onAddSatellite: (x: number, y: number, z: number, mass: number, name?: string) => { success: boolean; error?: string };
}

const EARTH_RADIUS = 6378;

export default function AddSatelliteForm({ onAddSatellite }: AddSatelliteFormProps) {
  const [x, setX] = useState('7000');
  const [y, setY] = useState('0');
  const [z, setZ] = useState('0');
  const [mass, setMass] = useState('1000');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const xVal = parseFloat(x);
    const yVal = parseFloat(y);
    const zVal = parseFloat(z);
    const massVal = parseFloat(mass);

    if (isNaN(xVal) || isNaN(yVal) || isNaN(zVal)) {
      toast.error('please enter valid coordinates');
      return;
    }

    if (isNaN(massVal) || massVal <= 0) {
      toast.error('please enter a valid mass (>0 kg)');
      return;
    }

    const result = onAddSatellite(xVal, yVal, zVal, massVal, name || undefined);
    
    if (result.success) {
      toast.success('satellite added to orbit!');
      setName('');
    } else {
      toast.error(result.error || 'failed to add satellite');
    }
  };

  const distance = Math.sqrt(
    parseFloat(x || '0') ** 2 + 
    parseFloat(y || '0') ** 2 + 
    parseFloat(z || '0') ** 2
  );
  const altitude = distance - EARTH_RADIUS;

  const presets = [
    { name: 'leo (400km)', x: 6778, y: 0, z: 0, desc: 'low earth orbit' },
    { name: 'meo (20,200km)', x: 26578, y: 0, z: 0, desc: 'gps altitude' },
    { name: 'geo (35,786km)', x: 42164, y: 0, z: 0, desc: 'geostationary' },
    { name: 'polar', x: 0, y: 0, z: 7000, desc: 'polar orbit' },
  ];

  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="w-4 h-4 text-primary" />
          add your satellite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            enter (x, y, z) coordinates in km from earth center. earth radius is ~6,378 km. 
            heavier satellites orbit slower.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map(preset => (
            <Button
              key={preset.name}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setX(preset.x.toString());
                setY(preset.y.toString());
                setZ(preset.z.toString());
              }}
              title={preset.desc}
            >
              {preset.name}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="x" className="text-xs">x (km)</Label>
              <Input
                id="x"
                type="number"
                value={x}
                onChange={(e) => setX(e.target.value)}
                placeholder="7000"
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Label htmlFor="y" className="text-xs">y (km)</Label>
              <Input
                id="y"
                type="number"
                value={y}
                onChange={(e) => setY(e.target.value)}
                placeholder="0"
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Label htmlFor="z" className="text-xs">z (km)</Label>
              <Input
                id="z"
                type="number"
                value={z}
                onChange={(e) => setZ(e.target.value)}
                placeholder="0"
                className="bg-secondary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="mass" className="text-xs">mass (kg)</Label>
              <Input
                id="mass"
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="1000"
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-xs">name (optional)</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-sat-1"
                className="bg-secondary/50"
              />
            </div>
          </div>

          <div className="p-2 rounded bg-secondary/30 text-xs font-mono">
            <span className="text-muted-foreground">altitude: </span>
            <span className={altitude < 160 ? 'text-danger' : altitude > 50000 ? 'text-warning' : 'text-success'}>
              {isNaN(altitude) ? '-' : `${altitude.toFixed(0)} km`}
            </span>
            <span className="text-muted-foreground ml-3">distance: </span>
            <span>{isNaN(distance) ? '-' : `${distance.toFixed(0)} km`}</span>
          </div>

          <Button type="submit" variant="glow" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            launch satellite
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
