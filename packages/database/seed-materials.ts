import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMaterials() {
  console.log('🌱 Seeding materials data...');

  try {
    // Get a company and user
    const company = await prisma.company.findFirst();
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ No user found. Please run seed script first.');
      return;
    }

    // Common materials (available to all companies)
    const commonMaterials = [
      {
        code: 'STL-001',
        name: 'Steel Plate 10mm',
        description: 'High-grade steel plate, 10mm thickness',
        category: 'Steel Products',
        subCategory: 'Plates',
        unit: 'PCS',
        type: 'RAW_MATERIAL' as const,
        hsnCode: '7208',
        minStockLevel: 100,
        maxStockLevel: 1000,
        reorderLevel: 200,
        reorderQuantity: 300,
        leadTimeDays: 7,
        standardCost: 850,
        isCritical: true,
        isHazardous: false,
        createdById: user.id
      },
      {
        code: 'BRG-001',
        name: 'Ball Bearing 6204',
        description: 'Single row deep groove ball bearing',
        category: 'Bearings',
        subCategory: 'Ball Bearings',
        unit: 'PCS',
        type: 'SPARE_PART' as const,
        hsnCode: '8482',
        minStockLevel: 50,
        maxStockLevel: 500,
        reorderLevel: 100,
        reorderQuantity: 200,
        leadTimeDays: 5,
        standardCost: 125,
        isCritical: true,
        isHazardous: false,
        createdById: user.id
      },
      {
        code: 'OIL-001',
        name: 'Lubricating Oil 20W-50',
        description: 'Multi-grade engine oil',
        category: 'Lubricants',
        subCategory: 'Engine Oil',
        unit: 'LTR',
        type: 'CONSUMABLE' as const,
        hsnCode: '2710',
        minStockLevel: 100,
        maxStockLevel: 1000,
        reorderLevel: 200,
        reorderQuantity: 500,
        leadTimeDays: 3,
        standardCost: 180,
        isCritical: false,
        isHazardous: true,
        createdById: user.id
      },
      {
        code: 'PKG-001',
        name: 'Corrugated Box 18x12x10',
        description: 'Standard corrugated packaging box',
        category: 'Packaging',
        subCategory: 'Boxes',
        unit: 'PCS',
        type: 'PACKING_MATERIAL' as const,
        hsnCode: '4819',
        minStockLevel: 500,
        maxStockLevel: 5000,
        reorderLevel: 1000,
        reorderQuantity: 2000,
        leadTimeDays: 2,
        standardCost: 15,
        isCritical: false,
        isHazardous: false,
        createdById: user.id
      }
    ];

    // Company-specific materials
    const companyMaterials = company ? [
      {
        code: 'FIN-001',
        name: 'Finished Product A',
        description: 'Main finished product from production line A',
        category: 'Finished Goods',
        subCategory: 'Product Line A',
        unit: 'PCS',
        type: 'FINISHED_GOOD' as const,
        hsnCode: '8501',
        minStockLevel: 0,
        maxStockLevel: 1000,
        reorderLevel: 0,
        reorderQuantity: 0,
        leadTimeDays: 0,
        standardCost: 2500,
        isCritical: false,
        isHazardous: false,
        companyId: company.id,
        createdById: user.id
      },
      {
        code: 'WIP-001',
        name: 'Sub Assembly X',
        description: 'Work in progress sub-assembly',
        category: 'Semi-Finished',
        subCategory: 'Sub Assemblies',
        unit: 'PCS',
        type: 'SEMI_FINISHED' as const,
        hsnCode: '8503',
        minStockLevel: 50,
        maxStockLevel: 500,
        reorderLevel: 100,
        reorderQuantity: 0,
        leadTimeDays: 0,
        standardCost: 1200,
        isCritical: true,
        isHazardous: false,
        companyId: company.id,
        createdById: user.id
      },
      {
        code: 'CHEM-001',
        name: 'Industrial Solvent X',
        description: 'Chemical solvent for cleaning processes',
        category: 'Chemicals',
        subCategory: 'Solvents',
        unit: 'LTR',
        type: 'CONSUMABLE' as const,
        hsnCode: '3814',
        minStockLevel: 20,
        maxStockLevel: 200,
        reorderLevel: 50,
        reorderQuantity: 100,
        leadTimeDays: 7,
        standardCost: 450,
        isCritical: false,
        isHazardous: true,
        companyId: company.id,
        createdById: user.id
      }
    ] : [];

    // Create common materials
    console.log('Creating common materials...');
    for (const material of commonMaterials) {
      const existing = await prisma.material.findUnique({
        where: { code: material.code }
      });

      if (!existing) {
        await prisma.material.create({
          data: material
        });
        console.log(`✅ Created common material: ${material.name}`);
      } else {
        console.log(`⏭️  Material ${material.code} already exists`);
      }
    }

    // Create company-specific materials
    if (company) {
      console.log('\nCreating company-specific materials...');
      for (const material of companyMaterials) {
        const existing = await prisma.material.findUnique({
          where: { code: material.code }
        });

        if (!existing) {
          await prisma.material.create({
            data: material
          });
          console.log(`✅ Created company material: ${material.name}`);
        } else {
          console.log(`⏭️  Material ${material.code} already exists`);
        }
      }
    }

    // Get material statistics
    const [totalMaterials, commonCount, companyCount] = await Promise.all([
      prisma.material.count(),
      prisma.material.count({ where: { companyId: null } }),
      company ? prisma.material.count({ where: { companyId: company.id } }) : 0
    ]);

    console.log('\n📊 Material Statistics:');
    console.log(`   Total Materials: ${totalMaterials}`);
    console.log(`   Common Materials: ${commonCount}`);
    console.log(`   Company Materials: ${companyCount}`);

    // Get category breakdown
    const categories = await prisma.material.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    console.log('\n📁 Materials by Category:');
    categories.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count.id} materials`);
    });

    console.log('\n✅ Materials data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding materials data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMaterials()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });