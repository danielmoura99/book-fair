"use client";

import { useEffect } from "react";

/**
 * Componente que melhora a aparência do terminal de consulta
 * Aplica classes e estilos específicos quando a página carrega
 */
export function TerminalEnhancer() {
  useEffect(() => {
    // Função para aplicar os estilos
    const enhanceTerminal = () => {
      // Aplicar classes ao cabeçalho
      const header = document.querySelector(
        ".flex.flex-col.items-center.justify-center"
      );
      if (header) {
        header.classList.add("terminal-header");
      }

      // Aplicar classe aos logos
      const logoContainer = document.querySelector(".flex.items-center.gap-8");
      if (logoContainer) {
        logoContainer.classList.add("terminal-logos");
      }

      // Aplicar classes à tabela
      const tables = document.querySelectorAll("table");
      tables.forEach((table) => {
        table.classList.add("terminal-table");
      });

      // Aplicar classes às áreas de scroll
      const scrollAreas = document.querySelectorAll(
        ".overflow-x-auto, [data-radix-scroll-area-viewport]"
      );
      scrollAreas.forEach((area) => {
        area.classList.add("terminal-scroll");
      });

      // Melhorar a barra de busca
      const searchBar = document.querySelector(".rounded-full.border-2");
      if (searchBar) {
        searchBar.classList.add("terminal-search");
      }

      // Aplicar classe ao subtítulo
      const subtitle = document.querySelector(".text-xl.text-muted-foreground");
      if (subtitle) {
        subtitle.classList.add("subtitle");
      }

      // Aplicar classe ao badge de terminal
      const terminalTitle = document.querySelector(
        ".text-3xl.font-bold.bg-blue-100"
      );
      if (terminalTitle) {
        terminalTitle.classList.add("badge");
      }

      // Aplicar classes ao footer
      const footer = document.querySelector("footer");
      if (footer) {
        footer.classList.add("terminal-footer");
      }

      // Aplicar classes às células de preço
      const applyPriceClasses = () => {
        // Selecionar células de preço
        const priceRegularCells = document.querySelectorAll(
          "td.text-right.font-medium.text-gray-600"
        );
        priceRegularCells.forEach((cell) => {
          cell.classList.add("price-regular");
        });

        const priceFairCells = document.querySelectorAll(
          "td.text-right.font-medium.text-blue-600"
        );
        priceFairCells.forEach((cell) => {
          cell.classList.add("price-fair");
        });

        // Aplicar classe à célula de desconto
        const discountCells = document.querySelectorAll(
          "td.text-right:has(.text-green-600)"
        );
        discountCells.forEach((cell) => {
          cell.classList.add("discount");
        });
      };

      // Aplicamos após um breve atraso para garantir que a tabela esteja carregada
      setTimeout(applyPriceClasses, 500);

      // Observer para detectar mudanças na tabela (como filtragem)
      const tableContainer = document.querySelector(".overflow-x-auto");
      if (tableContainer) {
        const observer = new MutationObserver(() => {
          applyPriceClasses();
        });

        observer.observe(tableContainer, {
          childList: true,
          subtree: true,
        });

        return () => observer.disconnect();
      }
    };

    // Aplicar os estilos após a montagem do componente
    enhanceTerminal();

    // Re-aplicar quando a página for redimensionada
    window.addEventListener("resize", enhanceTerminal);

    return () => {
      window.removeEventListener("resize", enhanceTerminal);
    };
  }, []);

  return null; // Não renderiza nada visualmente
}
