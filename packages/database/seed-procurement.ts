import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProcurement() {
  console.log('🌱 Seeding procurement data...');

  try {
    // Get a company and factory
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('❌ No company found. Please run seed script first.');
      return;
    }

    const factory = await prisma.factory.findFirst({
      where: { companyId: company.id }
    });
    if (!factory) {
      console.log('❌ No factory found. Please create a factory first.');
      return;
    }

    const user = await prisma.user.findFirst({
      where: { companyId: company.id }
    });
    if (!user) {
      console.log('❌ No user found. Please create a user first.');
      return;
    }

    // Create vendors
    const vendors = await Promise.all([
      prisma.vendor.create({
        data: {
          name: 'ABC Steel Suppliers',
          code: 'VEN-001',
          contactPerson: 'John Doe',
          email: 'contact@abcsteel.com',
          phone: '+1234567890',
          address: '123 Industrial Ave, Steel City',
          status: 'ACTIVE',
          companyId: company.id,
          categories: ['Steel', 'Metal Products']
        }
      }),
      prisma.vendor.create({
        data: {
          name: 'XYZ Industrial Parts',
          code: 'VEN-002',
          contactPerson: 'Jane Smith',
          email: 'sales@xyzparts.com',
          phone: '+1234567891',
          address: '456 Manufacturing Blvd',
          status: 'ACTIVE',
          companyId: company.id,
          categories: ['Bearings', 'Industrial Parts']
        }
      }),
      prisma.vendor.create({
        data: {
          name: 'Global Electronics',
          code: 'VEN-003',
          contactPerson: 'Mike Johnson',
          email: 'info@globalelec.com',
          phone: '+1234567892',
          address: '789 Tech Park',
          status: 'ACTIVE',
          companyId: company.id,
          categories: ['Electronics', 'Components']
        }
      })
    ]);

    console.log(`✅ Created ${vendors.length} vendors`);

    // Create material indents
    const indents = await Promise.all([
      prisma.materialIndent.create({
        data: {
          indentNumber: 'IND-2024-001',
          itemName: 'Steel Plates 10mm',
          itemCode: 'STL-10MM',
          quantity: 100,
          unit: 'PCS',
          requiredDate: new Date('2024-12-20'),
          priority: 'HIGH',
          status: 'APPROVED',
          description: 'Required for production line A',
          companyId: company.id,
          factoryId: factory.id,
          requestedById: user.id,
          approvedById: user.id,
          approvedAt: new Date()
        }
      }),
      prisma.materialIndent.create({
        data: {
          indentNumber: 'IND-2024-002',
          itemName: 'Ball Bearings 6204',
          itemCode: 'BRG-6204',
          quantity: 200,
          unit: 'PCS',
          requiredDate: new Date('2024-12-25'),
          priority: 'MEDIUM',
          status: 'PENDING',
          description: 'For maintenance department',
          companyId: company.id,
          factoryId: factory.id,
          requestedById: user.id
        }
      }),
      prisma.materialIndent.create({
        data: {
          indentNumber: 'IND-2024-003',
          itemName: 'Electronic Controllers',
          itemCode: 'ELEC-CTRL-01',
          quantity: 10,
          unit: 'PCS',
          requiredDate: new Date('2024-12-30'),
          priority: 'HIGH',
          status: 'APPROVED',
          description: 'Urgent requirement for control panel',
          companyId: company.id,
          factoryId: factory.id,
          requestedById: user.id,
          approvedById: user.id,
          approvedAt: new Date()
        }
      })
    ]);

    console.log(`✅ Created ${indents.length} material indents`);

    // Create RFQs for approved indents
    const approvedIndents = indents.filter(i => i.status === 'APPROVED');
    
    for (const indent of approvedIndents) {
      const rfq = await prisma.rFQ.create({
        data: {
          rfqNumber: `RFQ-2024-${indent.indentNumber.split('-')[2]}`,
          title: `RFQ for ${indent.itemName}`,
          description: indent.description || '',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'SENT',
          companyId: company.id,
          indentId: indent.id,
          createdById: user.id,
          items: {
            itemName: indent.itemName,
            itemCode: indent.itemCode || '',
            quantity: indent.quantity,
            unit: indent.unit,
            specifications: 'As per standard specifications'
          }
        }
      });

      // Add vendors to RFQ
      await Promise.all(
        vendors.map(vendor => 
          prisma.rFQVendor.create({
            data: {
              rfqId: rfq.id,
              vendorId: vendor.id,
              status: 'SENT',
              sentAt: new Date()
            }
          })
        )
      );

      // Create quotations from vendors
      const quotations = await Promise.all(
        vendors.map((vendor, index) => 
          prisma.quotation.create({
            data: {
              quotationNumber: `QT-2024-${rfq.rfqNumber.split('-')[2]}-${index + 1}`,
              rfqId: rfq.id,
              vendorId: vendor.id,
              companyId: company.id,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              status: 'SUBMITTED',
              totalAmount: (100 + index * 10) * indent.quantity, // Varying prices
              currency: 'USD',
              submittedAt: new Date(),
              items: [{
                itemName: indent.itemName,
                itemCode: indent.itemCode || '',
                quantity: indent.quantity,
                unit: indent.unit,
                unitPrice: 100 + index * 10,
                totalPrice: (100 + index * 10) * indent.quantity,
                deliveryDays: 7 + index * 2
              }],
              terms: {
                paymentTerms: '30 days net',
                deliveryTerms: 'FOB Factory',
                warranty: '12 months'
              }
            }
          })
        )
      );

      console.log(`✅ Created RFQ ${rfq.rfqNumber} with ${quotations.length} quotations`);

      // Create comparison for the first RFQ
      if (rfq.rfqNumber.endsWith('-001')) {
        const comparison = await prisma.quotationComparison.create({
          data: {
            rfqId: rfq.id,
            companyId: company.id,
            createdById: user.id,
            selectedQuotationId: quotations[0].id, // Select the first (cheapest) quotation
            status: 'COMPLETED',
            completedAt: new Date(),
            criteria: {
              priceWeight: 40,
              qualityWeight: 30,
              deliveryWeight: 20,
              termsWeight: 10
            }
          }
        });

        // Create approval request
        const approvalRequest = await prisma.approvalRequest.create({
          data: {
            module: 'PROCUREMENT',
            type: 'PURCHASE_ORDER',
            referenceId: comparison.id,
            title: `Approval for PO - ${indent.itemName}`,
            description: `Purchase order approval for ${indent.quantity} ${indent.unit} of ${indent.itemName}`,
            status: 'APPROVED',
            companyId: company.id,
            requestedById: user.id,
            currentApproverId: user.id,
            approvedById: user.id,
            approvedAt: new Date(),
            amount: quotations[0].totalAmount,
            currency: 'USD'
          }
        });

        // Create purchase order
        const po = await prisma.purchaseOrder.create({
          data: {
            poNumber: 'PO-2024-001',
            vendorId: quotations[0].vendorId,
            quotationId: quotations[0].id,
            companyId: company.id,
            factoryId: factory.id,
            status: 'APPROVED',
            totalAmount: quotations[0].totalAmount,
            currency: 'USD',
            deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            createdById: user.id,
            approvedById: user.id,
            approvedAt: new Date(),
            items: quotations[0].items,
            terms: quotations[0].terms
          }
        });

        console.log(`✅ Created complete procurement cycle for ${indent.itemName}`);
        console.log(`   - Comparison ID: ${comparison.id}`);
        console.log(`   - Approval Request ID: ${approvalRequest.id}`);
        console.log(`   - Purchase Order: ${po.poNumber}`);
      }
    }

    console.log('\n✅ Procurement data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding procurement data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedProcurement()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });