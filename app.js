/* ==========================================================================
   EHS HOME SERVICES - INTERACTIVE SCRIPT (FRAMER DUAL TONE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  const navbar = document.querySelector('.navbar-framer');
  
  // 1. ANIMAÇÕES AO SCROLL (INTERSECTION OBSERVER)
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Revela apenas uma vez
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // 2. CONTROLO DO ESTADO DO CABEÇALHO (SCROLL DETECTOR)
  const mainHeader = document.querySelector('.main-header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  // 3. WIDGET DE WHATSAPP (APARECIMENTO DO BALÃO DE TEXTO COM ATRASO)
  const whatsappTooltip = document.getElementById('whatsappTooltip');
  
  if (whatsappTooltip) {
    setTimeout(() => {
      whatsappTooltip.classList.add('visible');
    }, 2000); // 2 segundos de atraso
  }

  // 4. SIMULADOR DE POUPANÇA ENERGÉTICA & ROI
  const calcBill = document.getElementById('calcBill');
  const calcBillVal = document.getElementById('calcBillVal');
  const calcSystem = document.getElementById('calcSystem');
  const toggleEV = document.getElementById('toggleEV');
  const togglePool = document.getElementById('togglePool');
  const resCost = document.getElementById('resCost');
  const resSavingsYear = document.getElementById('resSavingsYear');
  const resRoi = document.getElementById('resRoi');
  const resSavings10Years = document.getElementById('resSavings10Years');

  function calculateSavings() {
    if (!calcBill || !calcSystem || !resSavingsYear || !resRoi || !resSavings10Years) return;

    const monthlyBill = parseFloat(calcBill.value);
    if (calcBillVal) {
      calcBillVal.textContent = `${monthlyBill}€`;
    }

    const systemType = calcSystem.value;
    const hasEV = toggleEV ? toggleEV.checked : false;
    const hasPool = togglePool ? togglePool.checked : false;

    let savingsRate = 0.50; // Taxa de poupança base
    let systemCost = 3500;  // Custo de instalação base

    if (systemType === 'solar') {
      savingsRate = 0.65;
      systemCost = 3200;
      if (hasEV) {
        savingsRate += 0.12; // Carro elétrico aumenta significativamente o autoconsumo diário
        systemCost += 1800;  // Custo de painéis adicionais + carregador inteligente
      }
      if (hasPool) {
        savingsRate += 0.08; // Bomba de calor e filtragem consomem energia solar direta
        systemCost += 1200;  // Painéis adicionais e dimensionamento técnico
      }
    } else if (systemType === 'heatpump') {
      savingsRate = 0.55;
      systemCost = 4500;
      if (hasPool) {
        savingsRate += 0.15; // Integração direta com aquecimento de água da piscina
        systemCost += 2800;  // Trocador de calor de alta capacidade
      }
    } else if (systemType === 'both') {
      savingsRate = 0.80;
      systemCost = 7200;
      if (hasEV) {
        savingsRate += 0.08;
        systemCost += 1800;
      }
      if (hasPool) {
        savingsRate += 0.07;
        systemCost += 2800;
      }
    }

    // Limitar a taxa máxima de poupança a 95%
    if (savingsRate > 0.95) savingsRate = 0.95;

    const annualSavings = monthlyBill * 12 * savingsRate;
    const roiYears = systemCost / annualSavings;
    const savings10Y = (annualSavings * 10) - systemCost;

    // Atualização de elementos no DOM
    if (resCost) {
      resCost.textContent = `${Math.round(systemCost)}€`;
    }
    resSavingsYear.textContent = `${Math.round(annualSavings)}€`;
    resRoi.textContent = `${roiYears.toFixed(1)} ${roiYears.toFixed(1) === '1.0' ? 'ano' : 'anos'}`;
    resSavings10Years.textContent = `${Math.round(savings10Y)}€`;
  }

  if (calcBill && calcSystem) {
    // Evento 'input' para atualizar instantaneamente enquanto se arrasta o slider
    calcBill.addEventListener('input', calculateSavings);
    calcSystem.addEventListener('change', calculateSavings);
    
    if (toggleEV) toggleEV.addEventListener('change', calculateSavings);
    if (togglePool) togglePool.addEventListener('change', calculateSavings);

    calculateSavings(); // Cálculo inicial
  }

  // 5. FAQ ACORDEÃO (TEMA CLARO)
  const faqItems = document.querySelectorAll('.faq-item-clear');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger-clear');
    const content = item.querySelector('.faq-content-clear');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Fechar todos os outros acordeões
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-content-clear').style.maxHeight = '0px';
          }
        });

        // Alternar o item atual
        if (isOpen) {
          item.classList.remove('active');
          content.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // 6. FORMULÁRIO DE CAPTAÇÃO DE LEADS NO RODAPÉ
  const footerBookingForm = document.getElementById('footerBookingForm');
  const footerSuccessMessage = document.getElementById('footerSuccessMessage');
  const footerServiceSelect = document.getElementById('footerService');

  if (footerBookingForm) {
    footerBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('footerName').value.trim();
      const phone = document.getElementById('footerPhone').value.trim();
      const service = footerServiceSelect.value;

      if (!name || !phone) {
        alert('Por favor, preencha o seu nome e telefone.');
        return;
      }

      // Ocultar formulário e exibir mensagem de sucesso
      footerBookingForm.style.display = 'none';
      
      if (footerSuccessMessage) {
        footerSuccessMessage.style.display = 'block';
        footerSuccessMessage.classList.add('reveal', 'active');
      }

      // Log do lead simulado
      console.log('Lead Recebida (Framer Web):', {
        name,
        phone,
        service,
        timestamp: new Date().toISOString()
      });
    });
  }

  // 7. SCROLL SUAVE E DIRECIONAMENTO DE SERVIÇO
  const actionLinks = document.querySelectorAll('[data-scroll-to]');

  actionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      // Obter o serviço para pré-selecionar
      const serviceToSelect = link.getAttribute('data-service');
      
      if (serviceToSelect && footerServiceSelect) {
        footerServiceSelect.value = serviceToSelect;
      }

      // Reset do formulário caso o utilizador já o tenha enviado anteriormente
      if (footerBookingForm && footerBookingForm.style.display === 'none') {
        footerBookingForm.style.display = 'block';
        if (footerSuccessMessage) footerSuccessMessage.style.display = 'none';
        footerBookingForm.reset();
        if (serviceToSelect && footerServiceSelect) {
          footerServiceSelect.value = serviceToSelect;
        }
      }

      // Scroll suave
      if (targetElement) {
        // Obtermos offset devido à navbar sticky
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 8. SLIDER INTERATIVO ANTES/DEPOIS (HIGIENIZAÇÃO)
  const rangeSlider = document.getElementById('beforeAfterRange');
  const imgBefore = document.querySelector('.before-after-slider .img-before');
  const sliderBar = document.querySelector('.before-after-slider .slider-bar');

  if (rangeSlider && imgBefore && sliderBar) {
    rangeSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      imgBefore.style.width = `${value}%`;
      sliderBar.style.left = `${value}%`;
    });
  }

  // 9. CONTROLO DO MENU MÓVEL OVERLAY
  const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuTrigger && mobileMenuOverlay) {
    const openMenu = () => {
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    mobileMenuTrigger.addEventListener('click', openMenu);
    
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMenu);
    }

    // Fechar menu quando clica fora do conteúdo
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay) {
        closeMenu();
      }
    });

    // Fechar menu ao clicar em qualquer link móvel e rolar suavemente
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();

        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          setTimeout(() => {
            const navbarHeight = navbar ? navbar.offsetHeight : 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }, 300); // Pequena pausa para a animação do menu fechar primeiro
        }
      });
    });
  }

  // 10. VISIBILIDADE DO STICKY CTA MÓVEL (CRO)
  const stickyMobileCta = document.getElementById('stickyMobileCta');
  const whatsappWrapper = document.querySelector('.whatsapp-wrapper');
  if (stickyMobileCta) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      
      // Surge após scroll de 500px e oculta ao chegar próximo do formulário do rodapé
      if (scrollY > 500 && (documentHeight - scrollY - windowHeight > 450)) {
        stickyMobileCta.classList.add('visible');
        if (whatsappWrapper) {
          whatsappWrapper.classList.add('shifted');
        }
      } else {
        stickyMobileCta.classList.remove('visible');
        if (whatsappWrapper) {
          whatsappWrapper.classList.remove('shifted');
        }
      }
    });
  }
});
