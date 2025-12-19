/**
 * Script to add Fulltext indexes for better search performance
 * Run this script: node backend/scripts/add_fulltext_indexes.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addFulltextIndexes() {
    try {
        console.log('🚀 Starting to add Fulltext indexes...');

        // Check if ngram parser is available (for better Vietnamese support)
        // If not available, indexes will be created without parser

        const indexes = [
            {
                table: 'sach',
                name: 'idx_fulltext_sach',
                columns: ['ten_sach', 'mo_ta'],
                description: 'Fulltext index on sach (ten_sach, mo_ta)'
            },
            {
                table: 'tacgia',
                name: 'idx_fulltext_tacgia',
                columns: ['ten_tac_gia'],
                description: 'Fulltext index on tacgia (ten_tac_gia)'
            },
            {
                table: 'danhmuc',
                name: 'idx_fulltext_danhmuc',
                columns: ['ten_danh_muc'],
                description: 'Fulltext index on danhmuc (ten_danh_muc)'
            },
            {
                table: 'nhaxuatban',
                name: 'idx_fulltext_nhaxuatban',
                columns: ['ten_nha_xuat_ban'],
                description: 'Fulltext index on nhaxuatban (ten_nha_xuat_ban)'
            },
            {
                table: 'thuonghieu',
                name: 'idx_fulltext_thuonghieu',
                columns: ['ten_thuong_hieu'],
                description: 'Fulltext index on thuonghieu (ten_thuong_hieu)'
            }
        ];

        for (const index of indexes) {
            try {
                // Check if index already exists
                const checkIndex = await prisma.$queryRawUnsafe(
                    `SHOW INDEX FROM ${index.table} WHERE Key_name = ?`,
                    index.name
                );

                if (Array.isArray(checkIndex) && checkIndex.length > 0) {
                    console.log(`⏭️  Index ${index.name} already exists, skipping...`);
                    continue;
                }

                // Try to create with ngram parser first (for Vietnamese support)
                try {
                    const columns = index.columns.join(', ');
                    await prisma.$executeRawUnsafe(
                        `ALTER TABLE ${index.table} ADD FULLTEXT INDEX ${index.name} (${columns}) WITH PARSER ngram`
                    );
                    console.log(`✅ Created ${index.description} with ngram parser`);
                } catch (ngramError) {
                    // If ngram parser is not available, create without it
                    console.log(`⚠️  ngram parser not available, creating without parser...`);
                    const columns = index.columns.join(', ');
                    await prisma.$executeRawUnsafe(
                        `ALTER TABLE ${index.table} ADD FULLTEXT INDEX ${index.name} (${columns})`
                    );
                    console.log(`✅ Created ${index.description} without ngram parser`);
                }
            } catch (error) {
                console.error(`❌ Error creating index ${index.name}:`, error.message);
            }
        }

        console.log('✨ Fulltext indexes added successfully!');
        console.log('\n📝 Note:');
        console.log('   - Fulltext search works best with keywords >= 3 characters');
        console.log('   - For better Vietnamese support, ensure ngram parser is enabled in MySQL');
        console.log('   - You may need to restart MySQL after enabling ngram parser');

    } catch (error) {
        console.error('❌ Error adding Fulltext indexes:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
addFulltextIndexes()
    .then(() => {
        console.log('\n🎉 Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });

