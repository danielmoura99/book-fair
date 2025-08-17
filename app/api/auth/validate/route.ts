import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    
    const ADMIN_PASSWORD = process.env.AUTH_PASS;
    
    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Senha de administrador não configurada" },
        { status: 500 }
      );
    }
    
    const isValid = password === ADMIN_PASSWORD;
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Erro na validação de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}