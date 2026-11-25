import React, { useState } from 'react';

// --- Types ---
export interface WeaponItem {
  id: string;
  name: string;
  type: 'ASSAULT' | 'SNIPER' | 'SIDEARM' | 'EXPLOSIVE' | 'HEAVY' | 'GRENADE';
  stock: number;
  condition: number; // 0-100%
  status: 'READY' | 'MAINTENANCE' | 'DEPLETED';
  image: string;
  specs: string;
  location: string;
  serialRange: string;
}

export interface VehicleItem {
  id: string;
  name: string;
  type: 'LAND' | 'AIR' | 'SEA' | 'DRONE' | 'ARTILLERY';
  location: string;
  fuel: number; // 0-100%
  ammo: number; // 0-100%
  status: 'DEPLOYED' | 'BASE' | 'REPAIR';
  image: string;
  loadout: string;
  operatorUnit: string;
}

export interface GearItem {
  id: string;
  name: string;
  type: 'ARMOR' | 'OPTICS' | 'COMMS' | 'DRONE' | 'MEDICAL' | 'PROTECTIVE' | 'POWER';
  stock: number;
  condition: number;
  status: 'READY' | 'ISSUED' | 'MAINTENANCE';
  image: string;
  specs: string;
  assignedTo: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: 'FUEL' | 'RATIONS' | 'AMMO' | 'MEDICAL' | 'POWER' | 'EQUIPMENT';
  level: number; // 0-100%
  quantity: string;
  status: 'OPTIMAL' | 'LOW' | 'CRITICAL';
  reorderPoint: string;
  primarySupplier: string;
}

// --- Logistics Image Component with Fallback ---
const LogisticsImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  category: 'weapon' | 'vehicle' | 'gear';
}> = ({ src, alt, className, category }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#1a1408] border border-amber-900/40 p-4 text-center w-full h-full ${className}`}>
        <div className="w-10 h-10 rounded-full bg-amber-900/40 flex items-center justify-center mb-2 border border-amber-500/30">
          {category === 'weapon' ? (
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ) : category === 'vehicle' ? (
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1e-2h7a1 1 0 001-1V9a1 1 0 00-1-1h-2.586a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 0011.586 5H9" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
        </div>
        <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">{alt}</span>
        <span className="text-[8px] font-mono text-amber-600 uppercase mt-0.5">[TACTICAL SCHEMATIC]</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
};

// --- Complete 30+ Item Logistics Inventory Dataset ---
const INITIAL_WEAPONS: WeaponItem[] = [
  {
    id: 'WPN-001',
    name: 'INSAS Excalibur Mark-I',
    type: 'ASSAULT',
    stock: 450,
    condition: 98,
    status: 'READY',
    image: '/logistics/weapons/insas.jpg',
    specs: '5.56x45mm NATO • Folding Stock • 30-Rnd Mag',
    location: 'Central Armory Depot Alpha',
    serialRange: 'IN-EX-8820 to 9270'
  },
  {
    id: 'WPN-002',
    name: 'Vidhwansak AMR',
    type: 'SNIPER',
    stock: 25,
    condition: 100,
    status: 'READY',
    image: '/logistics/weapons/vidhwansak.jpg',
    specs: '12.7x108mm Anti-Materiel • 1800m Range',
    location: 'Special Tactics Cell - Bay 3',
    serialRange: 'VD-AMR-001 to 025'
  },
  {
    id: 'WPN-003',
    name: 'Micro-Uzi Tactical',
    type: 'SIDEARM',
    stock: 120,
    condition: 85,
    status: 'READY',
    image: '/logistics/weapons/uzi.jpg',
    specs: '9mm Parabellum • Suppressed • 1200 RPM',
    location: 'Urban Quick Reaction Cell',
    serialRange: 'UZI-TAC-400 to 520'
  },
  {
    id: 'WPN-004',
    name: 'Carl Gustaf M4',
    type: 'HEAVY',
    stock: 12,
    condition: 40,
    status: 'MAINTENANCE',
    image: '/logistics/weapons/carl_gustaf.jpg',
    specs: '84mm Recoilless • Guided HEAT Shells',
    location: 'Heavy Weapons Depot Sector 4',
    serialRange: 'CG-M4-012 to 024'
  },
  {
    id: 'WPN-005',
    name: 'C-4 Demolition Kit',
    type: 'EXPLOSIVE',
    stock: 8,
    condition: 15,
    status: 'DEPLETED',
    image: '/logistics/weapons/c4.jpg',
    specs: 'M112 Block • M1A1 Wireless Detonator',
    location: 'High-Explosive Bunker Bravo',
    serialRange: 'C4-EXP-900 to 908'
  },
  {
    id: 'WPN-006',
    name: 'AK-203 Tactical Rifle',
    type: 'ASSAULT',
    stock: 310,
    condition: 95,
    status: 'READY',
    image: '/logistics/weapons/ak203.jpg',
    specs: '7.62x39mm Russian • Picatinny Quad Rail',
    location: 'Northern Border Outpost 2',
    serialRange: 'AK203-IND-100 to 410'
  },
  {
    id: 'WPN-007',
    name: 'Sako TRG-42 Sniper',
    type: 'SNIPER',
    stock: 18,
    condition: 92,
    status: 'READY',
    image: '/logistics/weapons/sako_trg.jpg',
    specs: '.338 Lapua Magnum • Schmidt & Bender Scope',
    location: 'Precision Marksmen Vault',
    serialRange: 'ST-42-001 to 018'
  },
  {
    id: 'WPN-008',
    name: 'Tavor TAR-21 Bullpup',
    type: 'ASSAULT',
    stock: 195,
    condition: 88,
    status: 'READY',
    image: '/logistics/weapons/tavor.jpg',
    specs: '5.56x45mm NATO • ITL MARS Red Dot Sight',
    location: 'Marcos Commando Logistics',
    serialRange: 'TAR21-MAR-050 to 245'
  },
  {
    id: 'WPN-009',
    name: 'Glock 17 Gen 5',
    type: 'SIDEARM',
    stock: 280,
    condition: 96,
    status: 'READY',
    image: '/logistics/weapons/glock17.jpg',
    specs: '9x19mm Parabellum • Tritium Night Sights',
    location: 'Police Headquarters Vault',
    serialRange: 'G17-G5-1001 to 1280'
  },
  {
    id: 'WPN-010',
    name: 'AGS-30 Heavy Launcher',
    type: 'GRENADE',
    stock: 14,
    condition: 75,
    status: 'READY',
    image: '/logistics/weapons/ags30.jpg',
    specs: '30mm Automatic Grenade • Tripod Mounted',
    location: 'Perimeter Defense Post 7',
    serialRange: 'AGS30-HD-001 to 014'
  }
];

const INITIAL_VEHICLES: VehicleItem[] = [
  {
    id: 'V-LAND-01',
    name: 'Tata Safari Storme Armored',
    type: 'LAND',
    location: 'Sector 4 Rapid Base',
    fuel: 85,
    ammo: 100,
    status: 'BASE',
    image: '/logistics/vehicles/tata_safari.jpg',
    loadout: 'STANAG Level 3 Armor • Jammer Pod',
    operatorUnit: '3rd Escort Battalion'
  },
  {
    id: 'V-AIR-02',
    name: 'HAL Dhruv Mk.IV Rudra',
    type: 'AIR',
    location: 'Forward Air Base Sector 9',
    fuel: 30,
    ammo: 45,
    status: 'REPAIR',
    image: '/logistics/vehicles/hal_dhruv.jpg',
    loadout: '20mm M621 Cannon • Helina ATGMs',
    operatorUnit: '102nd Air Recon Squadron'
  },
  {
    id: 'V-LAND-03',
    name: 'T-90 Bhishma MBT',
    type: 'LAND',
    location: 'Border Outpost Sector 12',
    fuel: 92,
    ammo: 100,
    status: 'DEPLOYED',
    image: '/logistics/vehicles/t90_bhishma.jpg',
    loadout: '125mm Smoothbore • Kontakt-5 ERA',
    operatorUnit: '45th Armored Regiment'
  },
  {
    id: 'V-SEA-04',
    name: 'Fast Interceptor Craft FIC',
    type: 'SEA',
    location: 'Mumbai Harbor Naval Base',
    fuel: 60,
    ammo: 80,
    status: 'DEPLOYED',
    image: '/logistics/vehicles/interceptor_craft.jpg',
    loadout: 'Dual 12.7mm M2 Browning • Navigation Radar',
    operatorUnit: 'Coastal Security Guard'
  },
  {
    id: 'V-LAND-05',
    name: 'Mahindra Armado ALSV',
    type: 'LAND',
    location: 'Urban Response Center',
    fuel: 78,
    ammo: 90,
    status: 'BASE',
    image: '/logistics/vehicles/armado.jpg',
    loadout: 'B6 Level Protection • Remote Gun Station',
    operatorUnit: 'Special Operations Wing'
  },
  {
    id: 'V-DRONE-06',
    name: 'DRDO Netra UAV Unit',
    type: 'DRONE',
    location: 'High Altitude Recon Station',
    fuel: 100,
    ammo: 0,
    status: 'DEPLOYED',
    image: '/logistics/vehicles/netra_drone.jpg',
    loadout: 'Thermal FLIR Pod • Encrypted Datalink',
    operatorUnit: 'Intelligence Surveillance Cell'
  },
  {
    id: 'V-LAND-07',
    name: 'BMP-2 Sarath ICV',
    type: 'LAND',
    location: 'Tactical Forward Post 5',
    fuel: 65,
    ammo: 85,
    status: 'DEPLOYED',
    image: '/logistics/vehicles/bmp2.jpg',
    loadout: '30mm 2A42 Cannon • Konkurs Launcher',
    operatorUnit: 'Mechanized Infantry Brigade'
  },
  {
    id: 'V-AIR-08',
    name: 'Su-30MKI Reconnaissance',
    type: 'AIR',
    location: 'Hasimara Air Force Station',
    fuel: 95,
    ammo: 100,
    status: 'BASE',
    image: '/logistics/vehicles/su30mki.jpg',
    loadout: 'Litening Pod • BrahMos-A Missile',
    operatorUnit: 'No. 222 Squadron Tiger Sharks'
  },
  {
    id: 'V-ART-09',
    name: 'K9 Vajra-T Self-Propelled',
    type: 'ARTILLERY',
    location: 'Desert Artillery Range',
    fuel: 88,
    ammo: 70,
    status: 'BASE',
    image: '/logistics/vehicles/k9_vajra.jpg',
    loadout: '155mm/52 Caliber Howitzer • Automatic Loader',
    operatorUnit: 'Regiment of Artillery'
  },
  {
    id: 'V-LAND-10',
    name: 'Swathi Weapon Locating Radar',
    type: 'LAND',
    location: 'Forward Command HQ',
    fuel: 50,
    ammo: 0,
    status: 'BASE',
    image: '/logistics/vehicles/swathi_radar.jpg',
    loadout: 'Phased Array C-Band • Counter-Battery Tracking',
    operatorUnit: '4th Radar Battery'
  }
];

const INITIAL_GEAR: GearItem[] = [
  {
    id: 'GER-001',
    name: 'DRDO Bhabha Kavach Armor',
    type: 'ARMOR',
    stock: 350,
    condition: 99,
    status: 'READY',
    image: '/logistics/gear/bhabha_kavach.jpg',
    specs: 'NIJ Level IV • Boron Carbide • 6.8kg',
    assignedTo: 'Reserve Central Logistics'
  },
  {
    id: 'GER-002',
    name: 'AN/PVS-14 Night Vision',
    type: 'OPTICS',
    stock: 180,
    condition: 91,
    status: 'ISSUED',
    image: '/logistics/gear/pvs14.jpg',
    specs: 'Gen 3 White Phosphor • Helmet Mount',
    assignedTo: 'Command Unit Bravo'
  },
  {
    id: 'GER-003',
    name: 'TADIRAN CNR-9000 Radio',
    type: 'COMMS',
    stock: 110,
    condition: 87,
    status: 'READY',
    image: '/logistics/gear/tactical_radio.jpg',
    specs: 'Frequency Hopping • AES-256 Encrypted',
    assignedTo: 'Tactical Signal Depot'
  },
  {
    id: 'GER-004',
    name: 'Black Hornet Nano Drone',
    type: 'DRONE',
    stock: 22,
    condition: 95,
    status: 'ISSUED',
    image: '/logistics/gear/black_hornet.jpg',
    specs: '33g Recon • 25 Min Flight • Live HD Feed',
    assignedTo: 'NSG Counter-Terror Squad'
  },
  {
    id: 'GER-005',
    name: 'Thermal Imager Scope TI-800',
    type: 'OPTICS',
    stock: 65,
    condition: 78,
    status: 'MAINTENANCE',
    image: '/logistics/gear/thermal_scope.jpg',
    specs: '640x512 Sensor • 1200m Detection',
    assignedTo: 'Optics Calibration Lab'
  },
  {
    id: 'GER-006',
    name: 'Field Trauma Station FTS-99',
    type: 'MEDICAL',
    stock: 45,
    condition: 100,
    status: 'READY',
    image: '/logistics/gear/medical_kit.jpg',
    specs: 'Surgical Resuscitation Kit • Hemostatic Gauze',
    assignedTo: 'Medical Battalion Bay'
  },
  {
    id: 'GER-007',
    name: 'CBRN Protective Suit Mk.3',
    type: 'PROTECTIVE',
    stock: 200,
    condition: 100,
    status: 'READY',
    image: '/logistics/gear/hazmat_suit.jpg',
    specs: 'Hazmat Hermetic Seal • Positive Pressure Blower',
    assignedTo: 'Chemical Defense Storage'
  },
  {
    id: 'GER-008',
    name: 'SATCOM Mobile Dish STT-500',
    type: 'COMMS',
    stock: 30,
    condition: 82,
    status: 'ISSUED',
    image: '/logistics/gear/satcom.jpg',
    specs: 'Ku-Band Foldable Dish • Auto-Targeting',
    assignedTo: 'Field HQ Strategic Comms'
  },
  {
    id: 'GER-009',
    name: 'EOD-9 Bomb Disposal Suit',
    type: 'PROTECTIVE',
    stock: 12,
    condition: 90,
    status: 'READY',
    image: '/logistics/gear/eod_suit.jpg',
    specs: 'Blast Deflection Composite • Cooling System',
    assignedTo: 'Bomb Disposal Squad HQ'
  },
  {
    id: 'GER-010',
    name: 'Solar Tactical Power Array',
    type: 'POWER',
    stock: 55,
    condition: 88,
    status: 'READY',
    image: '/logistics/gear/solar_generator.jpg',
    specs: '1.2kW Foldable Array • EMP Hardened',
    assignedTo: 'Field Outpost Power Grid'
  }
];

const INITIAL_RESOURCES: ResourceItem[] = [
  { id: 'RES-001', name: 'Aviation Fuel (JP-8)', type: 'FUEL', level: 78, quantity: '78,000 Liters', status: 'OPTIMAL', reorderPoint: '20,000 L', primarySupplier: 'IOC Military Logistics' },
  { id: 'RES-002', name: 'Ultra-Low Sulfur Diesel', type: 'FUEL', level: 42, quantity: '21,000 Liters', status: 'LOW', reorderPoint: '25,000 L', primarySupplier: 'BPCL Tactical Supply' },
  { id: 'RES-003', name: 'Combat MRE Ration Packs', type: 'RATIONS', level: 92, quantity: '18,500 Units', status: 'OPTIMAL', reorderPoint: '5,000 Units', primarySupplier: 'Defence Food Research Lab' },
  { id: 'RES-004', name: 'Advanced Surgical Kits', type: 'MEDICAL', level: 18, quantity: '45 Kits', status: 'CRITICAL', reorderPoint: '100 Kits', primarySupplier: 'Armed Forces Medical Depot' },
  { id: 'RES-005', name: '5.56x45mm NATO Crates', type: 'AMMO', level: 85, quantity: '1,200 Crates', status: 'OPTIMAL', reorderPoint: '300 Crates', primarySupplier: 'Ordnance Factory Board' },
  { id: 'RES-006', name: '7.62x39mm Russian Crates', type: 'AMMO', level: 68, quantity: '850 Crates', status: 'OPTIMAL', reorderPoint: '250 Crates', primarySupplier: 'Ordnance Factory Board' },
  { id: 'RES-007', name: '12.7mm Armor Piercing', type: 'AMMO', level: 25, quantity: '120 Crates', status: 'LOW', reorderPoint: '150 Crates', primarySupplier: 'Munitions India Limited' },
  { id: 'RES-008', name: 'Tactical Lithium Batteries', type: 'POWER', level: 12, quantity: '60 Units', status: 'CRITICAL', reorderPoint: '200 Units', primarySupplier: 'DRDO Energy Cell' },
  { id: 'RES-009', name: 'Signal Flare Cartridges', type: 'EQUIPMENT', level: 95, quantity: '2,400 Units', status: 'OPTIMAL', reorderPoint: '500 Units', primarySupplier: 'Ordnance Factory Board' },
  { id: 'RES-010', name: 'Water Purification Tablets', type: 'MEDICAL', level: 80, quantity: '50,000 Tablets', status: 'OPTIMAL', reorderPoint: '10,000 Tab', primarySupplier: 'Military Health Services' }
];

interface LogisticsManagementProps {
  onClose: () => void;
}

export const LogisticsManagement: React.FC<LogisticsManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'WEAPONS' | 'VEHICLES' | 'GEAR' | 'RESOURCES'>('WEAPONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Inventory Datasets
  const [weapons, setWeapons] = useState<WeaponItem[]>(INITIAL_WEAPONS);
  const [vehicles, setVehicles] = useState<VehicleItem[]>(INITIAL_VEHICLES);
  const [gear, setGear] = useState<GearItem[]>(INITIAL_GEAR);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);

  // Selection Modal
  const [selectedItem, setSelectedItem] = useState<{
    category: 'WEAPONS' | 'VEHICLES' | 'GEAR' | 'RESOURCES';
    data: any;
  } | null>(null);

  // Requisition Modal
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [requisitionSector, setRequisitionSector] = useState('Sector 4 Command');
  const [requisitionUrgency, setRequisitionUrgency] = useState<'PRIORITY' | 'EMERGENCY' | 'STANDARD'>('PRIORITY');
  const [requisitionNotes, setRequisitionNotes] = useState('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
      case 'OPTIMAL':
      case 'BASE':
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
      case 'MAINTENANCE':
      case 'LOW':
      case 'REPAIR':
      case 'ISSUED':
        return 'text-amber-400 border-amber-500/50 bg-amber-950/40';
      case 'DEPLETED':
      case 'CRITICAL':
        return 'text-rose-400 border-rose-500/50 bg-rose-950/40 animate-pulse';
      case 'DEPLOYED':
        return 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40';
      default:
        return 'text-gray-400 border-gray-500/50 bg-gray-900/20';
    }
  };

  // Filtered Datasets
  const filteredWeapons = weapons.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.id.toLowerCase().includes(searchQuery.toLowerCase()) || w.specs.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || w.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || w.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.id.toLowerCase().includes(searchQuery.toLowerCase()) || v.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || v.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredGear = gear.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.id.toLowerCase().includes(searchQuery.toLowerCase()) || g.specs.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || g.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || g.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || r.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate Metrics
  const totalAssetsCount = weapons.length + vehicles.length + gear.length + resources.length;
  const criticalShortagesCount = resources.filter(r => r.status === 'CRITICAL').length + weapons.filter(w => w.status === 'DEPLETED').length;
  const operationalReadyCount = weapons.filter(w => w.status === 'READY').length + vehicles.filter(v => v.status === 'BASE' || v.status === 'DEPLOYED').length + gear.filter(g => g.status === 'READY').length;

  // Handlers for updating stock/condition in details modal
  const handleStockUpdate = (delta: number) => {
    if (!selectedItem) return;
    if (selectedItem.category === 'WEAPONS') {
      const updated = weapons.map(w => w.id === selectedItem.data.id ? { ...w, stock: Math.max(0, w.stock + delta), status: w.stock + delta <= 0 ? 'DEPLETED' as const : w.status } : w);
      setWeapons(updated);
      setSelectedItem({ ...selectedItem, data: updated.find(w => w.id === selectedItem.data.id) });
      showToast(`Updated stock for ${selectedItem.data.name}`);
    } else if (selectedItem.category === 'GEAR') {
      const updated = gear.map(g => g.id === selectedItem.data.id ? { ...g, stock: Math.max(0, g.stock + delta) } : g);
      setGear(updated);
      setSelectedItem({ ...selectedItem, data: updated.find(g => g.id === selectedItem.data.id) });
      showToast(`Updated stock for ${selectedItem.data.name}`);
    }
  };

  const handleRequisitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    showToast(`Requisition order logged for ${selectedItem.data.name} -> ${requisitionSector} [${requisitionUrgency}]`);
    setIsRequisitionOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0a05] flex flex-col font-sans animate-in fade-in duration-300 text-amber-500 selection:bg-amber-500 selection:text-black">
      
      {/* Toast Bar */}
      {toastMessage && (
        <div className="absolute top-20 right-6 z-50 bg-amber-500 text-black px-4 py-2 rounded font-mono text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300 flex items-center animate-in slide-in-from-top-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="h-16 border-b border-amber-900/40 flex justify-between items-center px-6 bg-[#1a1408] shadow-lg shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-900/30 rounded border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-widest uppercase text-amber-100 flex items-center">
              Logistics & Tactical Supply Command
              <span className="ml-3 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                40 CLASSIFIED ASSETS
              </span>
            </h1>
            <div className="text-[10px] text-amber-600 font-mono tracking-widest">INVENTORY CONTROL • EQUIPMENT TELEMETRY • REQUISITION PIPELINE</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-4">
          <div className="flex bg-[#0c0a05] p-1 rounded border border-amber-900/40">
            {(['WEAPONS', 'VEHICLES', 'GEAR', 'RESOURCES'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setFilterType('ALL');
                  setFilterStatus('ALL');
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-all font-mono ${activeTab === tab ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'text-amber-600 hover:text-amber-300'}`}
              >
                {tab === 'WEAPONS' ? 'WEAPONS (10)' : tab === 'VEHICLES' ? 'VEHICLES (10)' : tab === 'GEAR' ? 'TACTICAL GEAR (10)' : 'SUPPLIES (10)'}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="p-2 hover:bg-amber-900/30 rounded text-amber-600 hover:text-amber-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-3 bg-[#120d05] border-b border-amber-900/30 text-xs font-mono shrink-0">
        <div className="flex items-center space-x-3 bg-[#0c0a05] p-2.5 rounded border border-amber-900/30">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">40</div>
          <div>
            <div className="text-[10px] text-amber-700 uppercase">Total Catalog Assets</div>
            <div className="text-amber-200 font-bold">100% Asset Tracked</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-[#0c0a05] p-2.5 rounded border border-amber-900/30">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">{operationalReadyCount}</div>
          <div>
            <div className="text-[10px] text-emerald-700 uppercase">Operational Readiness</div>
            <div className="text-emerald-300 font-bold">Combat Ready Units</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-[#0c0a05] p-2.5 rounded border border-amber-900/30">
          <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">{criticalShortagesCount}</div>
          <div>
            <div className="text-[10px] text-rose-700 uppercase">Critical Shortages</div>
            <div className="text-rose-300 font-bold">Immediate Reorder Req.</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-[#0c0a05] p-2.5 rounded border border-amber-900/30">
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">100%</div>
          <div>
            <div className="text-[10px] text-cyan-700 uppercase">System Sync Status</div>
            <div className="text-cyan-300 font-bold">Live Encryption active</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 bg-[#120d05] border-b border-amber-900/20 flex flex-wrap gap-4 items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 flex-grow max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by asset name, ID, location, or spec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c0a05] border border-amber-900/50 rounded px-3 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500 placeholder-amber-800 font-mono"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1.5 text-amber-700 hover:text-amber-400 text-xs">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-amber-800 uppercase text-[10px]">Filter Status:</span>
          {['ALL', 'READY', 'DEPLOYED', 'MAINTENANCE', 'CRITICAL'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-[10px] rounded border transition-all ${filterStatus === st ? 'bg-amber-900/40 border-amber-500 text-amber-300' : 'border-amber-900/30 text-amber-700 hover:text-amber-400'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="flex-grow overflow-y-auto p-6 relative">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* WEAPONS TAB */}
          {activeTab === 'WEAPONS' && (
            <div className="animate-in fade-in duration-300 space-y-6">
              {/* Type Filter Pills */}
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {['ALL', 'ASSAULT', 'SNIPER', 'SIDEARM', 'HEAVY', 'EXPLOSIVE', 'GRENADE'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 text-[10px] font-mono border rounded transition-all shrink-0 ${filterType === type ? 'border-amber-500 text-amber-300 bg-amber-950/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'border-amber-900/30 text-amber-700 hover:border-amber-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {filteredWeapons.length === 0 ? (
                <div className="text-center py-12 text-amber-700 font-mono text-xs border border-dashed border-amber-900/30 rounded">
                  NO WEAPON ASSETS MATCHING SEARCH FILTER
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWeapons.map(weapon => (
                    <div
                      key={weapon.id}
                      onClick={() => setSelectedItem({ category: 'WEAPONS', data: weapon })}
                      className="bg-[#14120e] border border-amber-900/30 rounded-lg overflow-hidden hover:border-amber-500/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-44 bg-black relative overflow-hidden flex items-center justify-center p-3 border-b border-amber-900/20">
                          <LogisticsImage
                            src={weapon.image}
                            alt={weapon.name}
                            category="weapon"
                            className="max-w-full max-h-full object-contain filter sepia-[0.3] contrast-125 group-hover:sepia-0 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 text-[9px] text-amber-400 font-mono border border-amber-900/50 rounded">
                            {weapon.id}
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono ${getStatusColor(weapon.status)}`}>
                              {weapon.status}
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-amber-950/80 px-2 py-0.5 text-[9px] text-amber-300 font-mono rounded border border-amber-900/40">
                            {weapon.type}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-amber-100 font-bold text-sm uppercase group-hover:text-amber-400 transition-colors">
                              {weapon.name}
                            </h3>
                            <p className="text-[10px] text-amber-700 font-mono mt-0.5">{weapon.specs}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-[#0c0a05] p-2 rounded border border-amber-900/30">
                              <div className="text-[9px] text-amber-700 uppercase">Inventory Stock</div>
                              <div className="text-lg font-mono text-amber-400 font-bold">{weapon.stock} <span className="text-[10px] font-normal text-amber-700">Units</span></div>
                            </div>

                            <div className="bg-[#0c0a05] p-2 rounded border border-amber-900/30">
                              <div className="text-[9px] text-amber-700 uppercase">Condition Rating</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex-grow h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${weapon.condition > 80 ? 'bg-emerald-500' : weapon.condition > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${weapon.condition}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-amber-200 font-mono font-bold">{weapon.condition}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0e0c08] border-t border-amber-900/20 text-[10px] font-mono text-amber-600 flex justify-between items-center">
                        <span className="truncate max-w-[180px]">📍 {weapon.location}</span>
                        <span className="text-amber-400 group-hover:underline">Inspect Specs →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VEHICLES TAB */}
          {activeTab === 'VEHICLES' && (
            <div className="animate-in fade-in duration-300 space-y-6">
              {/* Type Filter Pills */}
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {['ALL', 'LAND', 'AIR', 'SEA', 'DRONE', 'ARTILLERY'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 text-[10px] font-mono border rounded transition-all shrink-0 ${filterType === type ? 'border-amber-500 text-amber-300 bg-amber-950/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'border-amber-900/30 text-amber-700 hover:border-amber-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12 text-amber-700 font-mono text-xs border border-dashed border-amber-900/30 rounded">
                  NO VEHICLE ASSETS MATCHING SEARCH FILTER
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredVehicles.map(vehicle => (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedItem({ category: 'VEHICLES', data: vehicle })}
                      className="bg-[#14120e] border border-amber-900/30 rounded-lg p-4 flex flex-col md:flex-row gap-5 hover:border-amber-500/60 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="w-full md:w-56 h-40 bg-black rounded border border-amber-900/30 flex-shrink-0 relative overflow-hidden">
                        <LogisticsImage
                          src={vehicle.image}
                          alt={vehicle.name}
                          category="vehicle"
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 text-[9px] font-mono text-amber-400 rounded border border-amber-900/50">
                          {vehicle.id}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-amber-950/90 px-2 py-0.5 text-[9px] font-mono text-amber-300 rounded border border-amber-900/40">
                          {vehicle.type}
                        </div>
                      </div>

                      <div className="flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-amber-100 font-bold text-sm uppercase group-hover:text-amber-400 transition-colors">
                              {vehicle.name}
                            </h3>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono ${getStatusColor(vehicle.status)}`}>
                              {vehicle.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-700 font-mono mt-1">
                            📍 {vehicle.location} • <span className="text-amber-500">{vehicle.operatorUnit}</span>
                          </p>
                        </div>

                        {/* Telemetry Fuel and Ammo Bars */}
                        <div className="grid grid-cols-2 gap-4 bg-[#0c0a05] p-2.5 rounded border border-amber-900/20">
                          <div>
                            <div className="flex justify-between text-[9px] text-amber-700 font-mono uppercase mb-1 font-bold">
                              <span>Fuel Level</span>
                              <span className={vehicle.fuel < 30 ? 'text-rose-400 font-bold' : 'text-amber-300'}>{vehicle.fuel}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${vehicle.fuel < 30 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}
                                style={{ width: `${vehicle.fuel}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] text-amber-700 font-mono uppercase mb-1 font-bold">
                              <span>Munitions</span>
                              <span className="text-emerald-400">{vehicle.ammo}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${vehicle.ammo}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-amber-600 flex justify-between items-center pt-1 border-t border-amber-900/20">
                          <span className="truncate max-w-[200px]">📦 {vehicle.loadout}</span>
                          <span className="text-amber-400 group-hover:underline">Telemetry →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GEAR TAB */}
          {activeTab === 'GEAR' && (
            <div className="animate-in fade-in duration-300 space-y-6">
              {/* Type Filter Pills */}
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {['ALL', 'ARMOR', 'OPTICS', 'COMMS', 'DRONE', 'MEDICAL', 'PROTECTIVE', 'POWER'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 text-[10px] font-mono border rounded transition-all shrink-0 ${filterType === type ? 'border-amber-500 text-amber-300 bg-amber-950/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'border-amber-900/30 text-amber-700 hover:border-amber-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {filteredGear.length === 0 ? (
                <div className="text-center py-12 text-amber-700 font-mono text-xs border border-dashed border-amber-900/30 rounded">
                  NO TACTICAL GEAR MATCHING SEARCH FILTER
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGear.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem({ category: 'GEAR', data: item })}
                      className="bg-[#14120e] border border-amber-900/30 rounded-lg overflow-hidden hover:border-amber-500/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-44 bg-black relative overflow-hidden flex items-center justify-center p-3 border-b border-amber-900/20">
                          <LogisticsImage
                            src={item.image}
                            alt={item.name}
                            category="gear"
                            className="max-w-full max-h-full object-contain filter sepia-[0.3] contrast-125 group-hover:sepia-0 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 text-[9px] text-amber-400 font-mono border border-amber-900/50 rounded">
                            {item.id}
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-amber-100 font-bold text-sm uppercase group-hover:text-amber-400 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-[10px] text-amber-700 font-mono mt-0.5">{item.specs}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-[#0c0a05] p-2 rounded border border-amber-900/30">
                              <div className="text-[9px] text-amber-700 uppercase">Available Stock</div>
                              <div className="text-lg font-mono text-amber-400 font-bold">{item.stock} <span className="text-[10px] font-normal text-amber-700">Units</span></div>
                            </div>

                            <div className="bg-[#0c0a05] p-2 rounded border border-amber-900/30">
                              <div className="text-[9px] text-amber-700 uppercase">Condition Rating</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex-grow h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${item.condition > 80 ? 'bg-emerald-500' : item.condition > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${item.condition}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-amber-200 font-mono font-bold">{item.condition}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#0e0c08] border-t border-amber-900/20 text-[10px] font-mono text-amber-600 flex justify-between items-center">
                        <span className="truncate max-w-[180px]">🛡️ {item.assignedTo}</span>
                        <span className="text-amber-400 group-hover:underline">Inspect Gear →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'RESOURCES' && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(res => (
                  <div
                    key={res.id}
                    onClick={() => setSelectedItem({ category: 'RESOURCES', data: res })}
                    className="bg-[#14120e] p-5 rounded-lg border border-amber-900/30 hover:border-amber-500/60 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
                  >
                    <div className={`absolute top-0 right-0 w-28 h-28 rounded-full filter blur-3xl opacity-15 pointer-events-none ${res.status === 'CRITICAL' ? 'bg-rose-600' : res.status === 'LOW' ? 'bg-amber-600' : 'bg-emerald-600'}`}></div>

                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div>
                        <span className="text-[9px] font-mono text-amber-600 uppercase">{res.id} • {res.type}</span>
                        <h3 className="text-amber-100 font-bold text-sm uppercase group-hover:text-amber-400 transition-colors">{res.name}</h3>
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded border font-mono ${getStatusColor(res.status)}`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="my-3 relative z-10 bg-[#0c0a05] p-3 rounded border border-amber-900/30">
                      <div className="text-[9px] text-amber-700 uppercase">Current Inventory Reserve</div>
                      <div className="text-2xl font-mono text-amber-200 font-bold">{res.quantity}</div>
                      <div className="text-[9px] text-amber-600 font-mono mt-1">Reorder Threshold: <span className="text-amber-400">{res.reorderPoint}</span></div>
                    </div>

                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative z-10 my-2">
                      <div
                        className={`h-full ${res.status === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : res.status === 'LOW' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, res.level)}%` }}
                      ></div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-900/20 flex justify-between items-center text-[10px] font-mono text-amber-600 relative z-10">
                      <span>Supplier: {res.primarySupplier}</span>
                      <button className="text-amber-400 hover:text-white underline">Order Restock</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Critical Shortages Action Table */}
              <div className="bg-[#14120e] p-6 rounded-lg border border-rose-900/40 shadow-xl">
                <h3 className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center font-mono">
                  <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Emergency Restock Priority Queue
                </h3>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs font-mono min-w-[600px]">
                    <thead className="text-amber-700 border-b border-amber-900/30 uppercase text-[10px]">
                      <tr>
                        <th className="pb-2">ASSET IDENTIFIER</th>
                        <th className="pb-2">RESOURCE NAME</th>
                        <th className="pb-2">RESERVE STATUS</th>
                        <th className="pb-2">SUPPLIER DEPOT</th>
                        <th className="pb-2 text-right">DISPATCH ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="text-amber-300">
                      {resources.filter(r => r.status === 'CRITICAL' || r.status === 'LOW').map(r => (
                        <tr key={r.id} className="border-b border-amber-900/20 last:border-0 hover:bg-amber-900/10 transition-colors">
                          <td className="py-3 text-amber-500 font-bold">{r.id}</td>
                          <td className="py-3 font-bold">{r.name}</td>
                          <td className="py-3 text-rose-400 font-bold">{r.quantity} ({r.level}%)</td>
                          <td className="py-3 text-amber-600">{r.primarySupplier}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedItem({ category: 'RESOURCES', data: r });
                                setIsRequisitionOpen(true);
                              }}
                              className="bg-rose-950/60 text-rose-300 border border-rose-500/40 px-3 py-1 rounded hover:bg-rose-900 transition-colors text-[10px] font-bold uppercase"
                            >
                              EXPEDITE REQUISITION
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ITEM INSPECTION MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#14120e] border border-amber-500/50 rounded-lg max-w-2xl w-full p-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] font-mono text-amber-300 relative space-y-5">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-amber-600 hover:text-amber-300 text-lg font-bold"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 border-b border-amber-900/40 pb-3">
              <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded uppercase">
                {selectedItem.category} • {selectedItem.data.id}
              </span>
              <h2 className="text-lg font-bold uppercase text-amber-100">{selectedItem.data.name}</h2>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="h-52 bg-black rounded border border-amber-900/40 overflow-hidden relative flex items-center justify-center p-3">
                <LogisticsImage
                  src={selectedItem.data.image || '/logistics/weapons/insas.jpg'}
                  alt={selectedItem.data.name}
                  category={selectedItem.category === 'WEAPONS' ? 'weapon' : selectedItem.category === 'VEHICLES' ? 'vehicle' : 'gear'}
                  className="max-w-full max-h-full object-contain filter sepia-[0.2]"
                />
              </div>

              {/* Specifications and Control */}
              <div className="space-y-4 text-xs">
                <div className="bg-[#0c0a05] p-3 rounded border border-amber-900/30 space-y-2">
                  <div className="text-[10px] text-amber-600 uppercase font-bold">CLASSIFIED TECHNICAL SPECIFICATIONS</div>
                  <div className="text-amber-200">{selectedItem.data.specs || selectedItem.data.loadout || selectedItem.data.quantity}</div>
                </div>

                {selectedItem.data.location && (
                  <div className="text-amber-400">
                    <span className="text-amber-700 uppercase">Assigned Location:</span> {selectedItem.data.location}
                  </div>
                )}

                {selectedItem.data.stock !== undefined && (
                  <div className="bg-[#0c0a05] p-3 rounded border border-amber-900/30 space-y-2">
                    <div className="text-[10px] text-amber-700 uppercase font-bold">STOCK ADJUSTMENT CONTROLS</div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleStockUpdate(-1)}
                        className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold hover:bg-amber-900"
                      >
                        - 1
                      </button>
                      <span className="text-lg text-white font-bold">{selectedItem.data.stock} Units</span>
                      <button
                        onClick={() => handleStockUpdate(1)}
                        className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold hover:bg-amber-900"
                      >
                        + 1
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center border-t border-amber-900/40 pt-4">
              <button
                onClick={() => setIsRequisitionOpen(true)}
                className="bg-amber-500 text-black px-4 py-2 rounded font-bold text-xs uppercase hover:bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              >
                Issue Requisition Order
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-xs text-amber-600 hover:text-amber-300 uppercase underline"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUISITION ORDER FORM MODAL */}
      {isRequisitionOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleRequisitionSubmit}
            className="bg-[#14120e] border border-amber-500/60 rounded-lg max-w-lg w-full p-6 shadow-[0_0_30px_rgba(245,158,11,0.3)] font-mono text-amber-300 relative space-y-4"
          >
            <button
              type="button"
              onClick={() => setIsRequisitionOpen(false)}
              className="absolute top-4 right-4 text-amber-600 hover:text-amber-300 text-lg font-bold"
            >
              ✕
            </button>

            <h2 className="text-base font-bold uppercase text-amber-100 border-b border-amber-900/40 pb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Tactical Requisition Form
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-amber-700 uppercase mb-1">Target Asset</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedItem.data.name} [${selectedItem.data.id}]`}
                  className="w-full bg-[#0c0a05] border border-amber-900/50 rounded px-3 py-1.5 text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-amber-700 uppercase mb-1">Destination Sector / Post</label>
                <select
                  value={requisitionSector}
                  onChange={(e) => setRequisitionSector(e.target.value)}
                  className="w-full bg-[#0c0a05] border border-amber-900/50 rounded px-3 py-1.5 text-amber-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Sector 4 Command">Sector 4 Forward Command HQ</option>
                  <option value="Special Tactics Cell Bay 3">Special Tactics Cell Bay 3</option>
                  <option value="Northern Border Outpost 2">Northern Border Outpost 2</option>
                  <option value="Coastal Security Patrol">Coastal Security Patrol</option>
                  <option value="Mumbai High Security Cell">Mumbai High Security Cell</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-amber-700 uppercase mb-1">Dispatch Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STANDARD', 'PRIORITY', 'EMERGENCY'] as const).map(prio => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setRequisitionUrgency(prio)}
                      className={`py-1 text-[10px] font-bold rounded border ${requisitionUrgency === prio ? 'bg-amber-500 text-black border-amber-400' : 'border-amber-900/40 text-amber-700'}`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-amber-700 uppercase mb-1">Command Authorization Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter mission code or authorization rationale..."
                  value={requisitionNotes}
                  onChange={(e) => setRequisitionNotes(e.target.value)}
                  className="w-full bg-[#0c0a05] border border-amber-900/50 rounded p-2 text-amber-200 placeholder-amber-800 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-amber-900/40">
              <button
                type="button"
                onClick={() => setIsRequisitionOpen(false)}
                className="px-4 py-2 text-xs text-amber-600 hover:text-amber-300 uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 text-black px-5 py-2 rounded font-bold text-xs uppercase hover:bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
              >
                Submit Dispatch Order
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
