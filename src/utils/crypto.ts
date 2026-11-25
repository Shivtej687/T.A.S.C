// --- Cryptographic & Sync Utilities ---

export const generateHash = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  // Return a realistic 64-character hex hash
  return (hex + "ef0123456789abcdef0123456789abcdef0123456789abcd" + hex).substring(0, 64);
};

export const syncEvidenceFromCases = (casesListInput?: any[]) => {
  // Load cases
  let cases = casesListInput;
  if (!cases) {
    const storedCasesStr = localStorage.getItem('tasc_cases');
    if (storedCasesStr) {
      cases = JSON.parse(storedCasesStr);
    } else {
      return [];
    }
  }

  // Load current blockchain ledger
  const storedChainStr = localStorage.getItem('tasc_evidence_chain');
  
  // Base genesis + standard initial chain
  const INITIAL_CHAIN = [
    {
      index: 0,
      timestamp: "2024-01-01 00:00:00",
      caseId: "GENESIS",
      type: "DIGITAL",
      description: "Vault Initialization Block - Root CA",
      officerId: "SYS-ADMIN",
      dataHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
      signature: "SIG-ROOT-ALPHA",
      status: 'VERIFIED'
    },
    {
      index: 1,
      timestamp: "2024-10-24 14:15:22",
      caseId: "CASE-2024-089",
      type: "DIGITAL",
      description: "Server Access Logs - Mumbai Data Center (Red Mist)",
      officerId: "OP-774-A",
      dataHash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      prevHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      signature: "SIG-774-VIKRAM",
      status: 'VERIFIED',
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&w=800&q=80"
    },
    {
      index: 2,
      timestamp: "2024-10-24 16:45:10",
      caseId: "CASE-2024-089",
      type: "DIGITAL",
      description: "Malicious Worm Source Code Snippet (Red Mist)",
      officerId: "OP-774-A",
      dataHash: "b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01",
      prevHash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      signature: "SIG-774-VIKRAM",
      status: 'VERIFIED',
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  let currentLedger = storedChainStr ? JSON.parse(storedChainStr) : INITIAL_CHAIN;
  let ledgerUpdated = false;

  // Sync every piece of evidence from cases
  cases.forEach((c: any) => {
    if (c.evidence && c.evidence.length > 0) {
      c.evidence.forEach((imageUrl: string, idx: number) => {
        // Double-check real image links
        if (!imageUrl || !imageUrl.startsWith('http')) return;

        // Verify if it is already in the ledger
        const exists = currentLedger.some((block: any) => block.imageUrl === imageUrl);
        if (!exists) {
          const lastBlock = currentLedger[currentLedger.length - 1];
          const prevHash = lastBlock ? lastBlock.dataHash : "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4";
          const blockIndex = currentLedger.length;

          const description = `Verified evidence asset for case: ${c.title} (Location: ${c.location})`;
          const dataToHash = `${blockIndex}-${c.id}-${imageUrl}-${description}-${prevHash}`;
          const dataHash = generateHash(dataToHash);

          const cleanedName = c.officer.name.toUpperCase().replace(/[^A-Z]/g, '');
          const signature = `SIG-${c.officer.id || 'TASC-DISPATCH'}-${cleanedName.substring(0, 8)}`;

          const newBlock = {
            index: blockIndex,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            caseId: c.id,
            type: 'IMAGE' as const,
            description,
            officerId: c.officer.id || 'OP-UNKNOWN',
            dataHash,
            prevHash,
            signature,
            status: 'VERIFIED' as const,
            imageUrl
          };

          currentLedger.push(newBlock);
          ledgerUpdated = true;
        }
      });
    }
  });

  if (ledgerUpdated || !storedChainStr) {
    localStorage.setItem('tasc_evidence_chain', JSON.stringify(currentLedger));
  }
  return currentLedger;
};
