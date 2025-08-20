//app/api/debug/timezone/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verificar timezone do PostgreSQL
    const timezoneResult = await prisma.$queryRaw<{timezone: string}[]>`
      SELECT current_setting('TIMEZONE') as timezone;
    `;
    
    // Verificar data/hora atual no banco
    const currentTimeResult = await prisma.$queryRaw<{now: Date, utc_now: Date}[]>`
      SELECT NOW() as now, NOW() AT TIME ZONE 'UTC' as utc_now;
    `;
    
    // Pegar uma transação real para comparação
    const sampleTransaction = await prisma.transaction.findFirst({
      orderBy: { transactionDate: 'desc' },
      select: { 
        transactionDate: true,
        createdAt: true 
      }
    });

    return NextResponse.json({
      database_timezone: timezoneResult[0]?.timezone,
      database_now: currentTimeResult[0]?.now,
      database_utc_now: currentTimeResult[0]?.utc_now,
      sample_transaction_date: sampleTransaction?.transactionDate,
      sample_created_at: sampleTransaction?.createdAt,
      javascript_now: new Date(),
      javascript_timezone_offset: new Date().getTimezoneOffset(),
    });
  } catch (error) {
    console.error("Erro ao verificar timezone:", error);
    return NextResponse.json({ error: "Erro ao verificar timezone" }, { status: 500 });
  }
}