// Script para testar a exclusão de itens "Outros"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testExclusion() {
  console.log('=== TESTE DA EXCLUSÃO DE ITENS "OUTROS" ===\n');

  // 1. Verificar quantos itens "Outros" existem
  const outrosItems = await prisma.transaction.findMany({
    where: {
      type: 'SALE',
      book: {
        subject: 'Outros'
      }
    },
    include: {
      book: {
        select: {
          title: true,
          subject: true
        }
      }
    }
  });

  console.log(`Transações com assunto "Outros": ${outrosItems.length}`);
  
  if (outrosItems.length > 0) {
    const qtdOutros = outrosItems.reduce((sum, t) => sum + t.quantity, 0);
    console.log(`Quantidade total de itens "Outros": ${qtdOutros}`);
    
    // Mostrar alguns exemplos
    console.log('\nExemplos de itens "Outros":');
    outrosItems.slice(0, 5).forEach(item => {
      console.log(`- ${item.book.title} (${item.quantity} unidades)`);
    });
  }

  // 2. Query original (incluindo tudo)
  const allSales = await prisma.transaction.findMany({
    where: { type: 'SALE' },
    select: { quantity: true }
  });
  
  const totalComOutros = allSales.reduce((sum, t) => sum + t.quantity, 0);

  // 3. Query nova (excluindo "Outros")
  const salesSemOutros = await prisma.transaction.findMany({
    where: {
      type: 'SALE',
      book: {
        subject: {
          not: 'Outros'
        }
      }
    },
    select: { quantity: true }
  });
  
  const totalSemOutros = salesSemOutros.reduce((sum, t) => sum + t.quantity, 0);

  console.log('\n=== COMPARAÇÃO ===');
  console.log(`Total incluindo "Outros": ${totalComOutros}`);
  console.log(`Total excluindo "Outros": ${totalSemOutros}`);
  console.log(`Diferença: ${totalComOutros - totalSemOutros}`);

  // 4. Testar o relatório também
  const reportData = await prisma.transaction.groupBy({
    by: ['bookId'],
    where: {
      type: 'SALE',
      book: {
        subject: {
          not: 'Outros'
        }
      }
    },
    _sum: {
      quantity: true
    }
  });

  const reportTotal = reportData.reduce((sum, item) => sum + (item._sum.quantity || 0), 0);
  console.log(`Total do relatório (sem "Outros"): ${reportTotal}`);

  if (totalSemOutros === reportTotal) {
    console.log('✅ Dashboard e relatório agora batem!');
  } else {
    console.log('❌ Ainda há diferença entre dashboard e relatório');
  }
}

testExclusion()
  .catch(console.error)
  .finally(() => prisma.$disconnect());